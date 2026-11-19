"""Package already verified native STEP conversions; no CAD/kernel in web builds."""
import argparse,base64,json,pathlib,numpy as np
p=argparse.ArgumentParser();p.add_argument('--input',default='tmp/iter-cad');p.add_argument('--output',default='tmp/iter-cad-web/cad-data.js');a=p.parse_args();root=pathlib.Path(a.input)
parts=[]
def encode(values):
 flat=values.astype(np.int64).ravel();delta=np.diff(flat,prepend=0);zigzag=(delta<<1)^(delta>>63);encoded=bytearray()
 for value in zigzag.tolist():
  while value>=128:encoded.append((value&127)|128);value>>=7
  encoded.append(value)
 return base64.b64encode(encoded).decode()
specs=[('Toroidal_field_coil_a','tf',[40*i for i in range(9)]),('Toroidal_field_coil_b','tf',[20+40*i for i in range(9)]),('Central_solenoid','cs',[0])]
specs += [('Poloidal_field_coil_'+str(i)+('_plus_cage' if i==4 else ''),'pf',[0]) for i in range(1,7)]
specs += [('Vacuum_vessel_sector_1','vessel',[0,160,200,240,280,320])]+[('Vacuum_vessel_sector_'+str(i),'vessel',[0]) for i in range(2,5)]
specs += [('Divertor_triple_casette','divertor',[20*i for i in range(18)])]
for key,group,angles in specs:
 meta=json.loads((root/(key+'-native.json')).read_text());data=np.load(root/(key+'-native.npz'));v=data['vertices'].astype('<i2');f=data['triangles'].astype('<u4')
 if meta['version']!=3:raise RuntimeError('Unverified importer version: '+key)
 pf=int(key.split('_')[3]) if group=='pf' else None
 record=dict(id=key,part=group,rotations=angles,positionEncoding='int16-mm-delta-varint',indexEncoding='uint32-delta-varint',positions=encode(v),indices=encode(f),vertexCount=len(v),triangleCount=len(f),radius=float(np.hypot(v[:,0].astype(float),v[:,1].astype(float)).max()*.001),bounds=meta['meshBounds'],sections=meta['sectionCurves'],sectionAngle=meta['sectionAngleDegrees'],source=meta['file'],sourceSha256=meta['sourceSha256'],reduction=meta['reductionAttempts'],usedOriginal=meta['usedOriginalTriangulation'])
 if not meta.get('sectionBySolid'):raise RuntimeError('Section must be exported per solid: '+key)
 record['sectionBySolid']=True
 if 'clustering' in meta:record['clustering']=meta['clustering']
 if pf:record['coil']='PF'+str(pf)
 parts.append(record)
result=dict(schema=1,source='ITER Organization / Centre for Energy Research, 3D printable ITER v2.0',sourceURL='https://www.iter.org/fr/node/20687/make-your-own-tokamak-3d-printing',archiveURL='https://static.iter.org/com/3d/IO_3D_models_v2.0.zip',coordinates='STEP assembly frame; FreeCAD mm converted uniformly to m; rotations about global Z only',unit='m',parts=parts,counts=dict(tf=18,vessel=9,divertorTriples=18,divertorCassettes=54,pf=6,cs=1),blanketIncluded=False)
path=pathlib.Path(a.output);path.parent.mkdir(parents=True,exist_ok=True);result['parts']=[p for p in parts if p['part']!='vessel'];path.write_text('/* Derived from the official educational CAD model; source attribution and measured conversion records are retained below. */\nwindow.TokamakCADData='+json.dumps(result,separators=(',',':'))+';\n',encoding='utf-8');size=path.stat().st_size
for p in parts:
 if p['part']!='vessel':continue
 sector=path.with_name('cad-vessel-'+p['id'].split('_')[-1]+'.js');sector.write_text('/* Native ITER STEP sector; attribution in cad-data.js. */\nwindow.TokamakCADData.parts.push('+json.dumps(p,separators=(',',':'))+');\n',encoding='utf-8');size+=sector.stat().st_size
print(json.dumps(dict(file=str(path),bytes=size,uniqueTriangles=sum(x['triangleCount'] for x in parts),instancedTriangles=sum(x['triangleCount']*len(x['rotations']) for x in parts))))
