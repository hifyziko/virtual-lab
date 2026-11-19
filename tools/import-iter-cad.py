"""Optional offline importer; run with FreeCAD's Python, never in a normal web build.

Sources remain private in docs/fuze/podklady/iter-model. The exported mesh retains
the STEP assembly frame. FreeCAD converts STEP metres to its internal mm; the
only length conversion applied to the public result is the uniform factor .001.
"""
import argparse, base64, hashlib, json, math, pathlib, time
import FreeCAD as App
import Part, MeshPart
import numpy as np
import vtk
from vtk.util.numpy_support import numpy_to_vtk, numpy_to_vtkIdTypeArray, vtk_to_numpy

parser=argparse.ArgumentParser()
parser.add_argument('parts',nargs='*')
parser.add_argument('--reference',default='docs/fuze/podklady/iter-model')
parser.add_argument('--output',default='tmp/iter-cad')
parser.add_argument('--cluster-mm',type=float,default=None,help='Bounded vertex clustering; default 10 mm for divertor, disabled for other parts')
args=parser.parse_args();root=pathlib.Path(args.reference);out=pathlib.Path(args.output);out.mkdir(parents=True,exist_ok=True)
VERSION=3

def polydata(xyz,tri):
    p=vtk.vtkPolyData();pts=vtk.vtkPoints();pts.SetData(numpy_to_vtk(np.ascontiguousarray(xyz),deep=True));p.SetPoints(pts)
    cells=vtk.vtkCellArray();cells.SetCells(len(tri),numpy_to_vtkIdTypeArray(np.c_[np.full(len(tri),3),tri].astype(np.int64).ravel(),deep=True));p.SetPolys(cells);return p

def distance_stats(points,surface):
    distance=vtk.vtkImplicitPolyDataDistance();distance.SetInput(surface)
    errors=np.fromiter((abs(distance.EvaluateFunction(p)) for p in points),dtype=np.float64,count=len(points))
    return dict(max=float(errors.max(initial=0)),p99=float(np.percentile(errors,99)) if len(errors) else 0)

def reduce_checked(xyz,tri):
    source=polydata(xyz,tri);accepted=source;report=[]
    # FreeCAD Mesh.decimate is intentionally not used: it failed the measured
    # surface-distance check on the TF reference despite its nominal tolerance.
    for limit in (4.,.25):
        dec=vtk.vtkDecimatePro();dec.SetInputData(source);dec.SetTargetReduction(.9);dec.PreserveTopologyOn();dec.SplittingOff();dec.BoundaryVertexDeletionOff();dec.AccumulateErrorOn();dec.SetErrorIsAbsolute(1);dec.SetAbsoluteError(limit);dec.Update();candidate=dec.GetOutput()
        vertices=vtk_to_numpy(candidate.GetPoints().GetData());indices=vtk_to_numpy(candidate.GetPolys().GetData()).reshape(-1,4)[:,1:]
        forward=distance_stats(xyz,candidate);reverse=distance_stats(np.r_[vertices,vertices[indices[::8]].mean(1)],source)
        report.append(dict(vtkAbsoluteError=limit,triangles=len(indices),sourceVerticesMM=forward,reducedSurfaceSamplesMM=reverse))
        if max(forward['max'],reverse['max'])<=20:
            accepted=vtk.vtkPolyData();accepted.DeepCopy(candidate);break
    vertices=vtk_to_numpy(accepted.GetPoints().GetData()).copy();indices=vtk_to_numpy(accepted.GetPolys().GetData()).reshape(-1,4)[:,1:].copy()
    return vertices,indices,report,accepted is source

def section_curves(shape,angle):
    # Section each solid independently. A compound section has branching edges
    # at touching component interfaces and sortEdges can join unrelated bodies.
    return [curve for body in shape.Solids for curve in solid_section_curves(body,angle)]

def solid_section_curves(shape,angle):
    a=math.radians(angle);r=App.Vector(math.cos(a),math.sin(a),0);normal=App.Vector(math.sin(a),-math.cos(a),0)
    plane=Part.makePlane(60000,60000,App.Vector(-30000*r.x,-30000*r.y,-30000),normal,r)
    cut=shape.section(plane);curves=[]
    for group in Part.sortEdges(cut.Edges):
        line=[]
        for edge in group:
            points=edge.discretize(Deflection=2.)
            if line and points and (points[-1]-App.Vector(*line[-1])).Length<(points[0]-App.Vector(*line[-1])).Length:points.reverse()
            for p in points:
                if not line or (p-App.Vector(*line[-1])).Length>.01:line.append([p.x,p.y,p.z])
        if len(line)<2:continue
        arr=np.array(line);radial=arr[:,0]*r.x+arr[:,1]*r.y
        if radial.max()<0:continue
        coords=np.c_[radial,arr[:,2]]/1000
        if np.linalg.norm(np.diff(coords,axis=0),axis=1).sum()<.005:continue
        curves.append(np.round(coords,5).tolist())
    return curves

names=args.parts or [p.name for p in root.glob('*.stp')]
for name in names:
    source=root/name;stem=source.stem;dest=out/(stem+'-native.npz');meta=out/(stem+'-native.json')
    if meta.exists() and dest.exists() and json.loads(meta.read_text()).get('version')==VERSION:
        previous=json.loads(meta.read_text())
        if not previous.get('sectionBySolid'):
            cached=Part.Shape();cached.read(str((out/(stem+'-native.brep')).resolve()));angle=20 if name=='Vacuum_vessel_sector_1.stp' else previous['sectionAngleDegrees'];previous.update(sectionCurves=section_curves(cached,angle),sectionAngleDegrees=angle,sectionBySolid=True);meta.write_text(json.dumps(previous,separators=(',',':')),encoding='utf-8')
        print('CACHED '+name,flush=True);continue
    start=time.time();print('IMPORT '+name,flush=True)
    cache=out/(stem+'-native.brep');shape=Part.Shape()
    if cache.exists():shape.read(str(cache.resolve()))
    else:
        shape.read(str(source.resolve()));shape.exportBrep(str(cache.resolve()))
    print('BREP READY '+name,flush=True)
    bodies=shape.Solids
    if 'Divertor' in name:
        # All 5304 source solids were verified in the initial conversion. Do
        # not repeatedly integrate their analytic volumes just to pick a cut.
        solids=bodies;phi=None;angle=16.495625513958696
    else:
        masses=[(s,s.Volume) for s in bodies];masses=[(s,v) for s,v in masses if v>1e-3];solids=[s for s,v in masses];total=sum(v for s,v in masses);centres=[(s.CenterOfMass,v) for s,v in masses];cx=sum(p.x*v for p,v in centres)/total;cy=sum(p.y*v for p,v in centres)/total;phi=math.degrees(math.atan2(cy,cx));angle=round(phi/10)*10 if ('Vacuum' in name or 'Toroidal' in name) else 0
    solid=Part.makeCompound(solids)
    if name=='Vacuum_vessel_sector_1.stp':angle=20 # between ports, a closed chamber section
    print('MESH '+name+' solids='+str(len(solids))+' section='+str(angle),flush=True)
    mesh=MeshPart.meshFromShape(Shape=solid,LinearDeflection=12.,AngularDeflection=.35,Relative=False);v,f=mesh.Topology;xyz=np.array([[p.x,p.y,p.z] for p in v]);tri=np.array(f,dtype=np.uint32)
    original_bounds=np.r_[xyz.min(0),xyz.max(0)]/1000
    clustering=None;cell=args.cluster_mm if args.cluster_mm is not None else (10 if 'Divertor' in name else 0)
    if cell:
        # Keep an original vertex per spatial cell. Each triangle corner moves
        # by at most sqrt(3)*cell size; no axis rescaling or registration occurs.
        cells=np.floor(xyz/cell).astype(np.int32);_,representative,inverse=np.unique(cells,axis=0,return_index=True,return_inverse=True)
        vertices=xyz[representative];mapped=inverse[tri];keep=(mapped[:,0]!=mapped[:,1])&(mapped[:,1]!=mapped[:,2])&(mapped[:,2]!=mapped[:,0]);indices=mapped[keep]
        shift=np.linalg.norm(xyz-vertices[inverse],axis=1);clustering=dict(cellMM=cell,maxCornerDisplacementMM=float(shift.max()),collapsedTriangles=int((~keep).sum()),limitation='Features within one cell can merge; collapsed sub-cell triangles are omitted. Retained triangles have an explicit corner-correspondence displacement bound.')
        reductions=[];original=False
    else:vertices,indices,reductions,original=reduce_checked(xyz,tri)
    quantized=np.round(vertices).astype(np.int16)
    if abs(vertices).max()>32760:raise RuntimeError('Mesh exceeds signed millimetre encoding; choose wider encoding without rescaling')
    np.savez_compressed(dest,vertices=quantized,triangles=indices.astype(np.uint32))
    print('SECTION '+name,flush=True);curves=section_curves(solid,angle)
    result=dict(version=VERSION,file=name,sourceSha256=hashlib.sha256(source.read_bytes()).hexdigest(),unit='m',nativeToMetres=.001,assemblyFrame='unaltered STEP world coordinates',sourceSolids=len(shape.Solids),retainedSolids=len(solids),sourceTriangles=len(tri),triangles=len(indices),vertices=len(vertices),originalMeshBounds=original_bounds.tolist(),meshBounds=(np.r_[quantized.min(0),quantized.max(0)]/1000).tolist(),tessellationDeflectionMM=12,quantizationMM=1,reductionAttempts=reductions,usedOriginalTriangulation=original,sectionAngleDegrees=angle,sectionCurves=curves,volumeWeightedPhiDegrees=phi,seconds=time.time()-start)
    result['sectionBySolid']=True
    if clustering:result['clustering']=clustering
    meta.write_text(json.dumps(result,separators=(',',':')),encoding='utf-8')
    print('VERIFIED '+json.dumps({k:result[k] for k in ['file','retainedSolids','triangles','sectionAngleDegrees','seconds']}),flush=True)

