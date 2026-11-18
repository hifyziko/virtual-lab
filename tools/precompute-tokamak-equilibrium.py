"""Explicit ITER-like static forward atlas: python tools/precompute-tokamak-equilibrium.py --write.
Install tools/tokamak-requirements.txt, optionally --deps path. Never run during web build.
Only the reference state uses an inverse shape solve. Every experiment holds all coil
currents fixed except the named coil. Newton-Krylov finds a static root, not feedback.
"""
import os,sys,json,pathlib,argparse,time,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[1]
os.environ.setdefault('MPLBACKEND','Agg');os.environ.setdefault('MPLCONFIGDIR',str(ROOT/'tmp/mplconfig'))
parser=argparse.ArgumentParser();parser.add_argument('--write',action='store_true');parser.add_argument('--deps');parser.add_argument('--n',type=int,default=65);parser.add_argument('--resume',action='store_true');parser.add_argument('--steering-only',action='store_true')
a=parser.parse_args()
if not a.write:parser.error('Explicit --write required')
if a.deps:sys.path.insert(0,a.deps)
import numpy as np,freegs
from scipy.optimize import newton_krylov
from freegs.machine import Machine,Coil
# Factual geometric parameters: ITER Organization/JOREK polcoils_iter.nml,
# STARWALL_J dataset (M. Hoelzl, 2017-03-01). Effective winding counts.
COILS=[['PF1',3.954,7.557,.726,.81334,248.6],['PF2',8.309,6.530,.433,.397,115.2],['PF3',11.935,3.265,.472,.938,185.9],['PF4',11.905,-2.243,.433,.900,169.9],['PF5',8.395,-6.730,.615,.756,216.8],['PF6',4.287,-7.557,1.429,.781,459.4]]+[[name,1.688,z,.562,1.827,554] for name,z in [('CS3U',5.071),('CS2U',3.043),('CS1U',1.014),('CS1L',-1.014),('CS2L',-3.043),('CS3L',-5.071)]]
G=dict(n=a.n,rmin=3.2,rmax=9.2,zmin=-5.,zmax=5.)
eq=freegs.Equilibrium(tokamak=Machine([(c[0],Coil(c[1],c[2])) for c in COILS]),Rmin=G['rmin'],Rmax=G['rmax'],Zmin=G['zmin'],Zmax=G['zmax'],nx=a.n,ny=a.n,boundary=freegs.boundary.freeBoundaryHagenow)
def profiles(pressure):return freegs.jtor.ConstrainPaxisIp(eq,pressure,15e6,6.2*5.3)
p=profiles(5e5);x=(5.,-3.4)
constrain=freegs.control.constrain(xpoints=[x],isoflux=[(*x,4.15,.45),(*x,8.25,.45),(*x,5.7,3.65),(*x,7.3,2.8)],gamma=1e-13)
freegs.solve(eq,p,constrain,rtol=1e-8,maxits=200)
reference=eq.plasma_psi.copy();currents=np.array([c.current for _,c in eq.tokamak.coils]);MU=4e-7*np.pi

def forward(initial,pressure):
 p=profiles(pressure);fixed=np.array([c.current for _,c in eq.tokamak.coils]);vac=eq.tokamak.calcPsiFromGreens(eq._pgreen)
 def residual(flat):
  psi=flat.reshape(reference.shape).copy();eq._updatePlasmaPsi(psi.copy());eq.solve(p,psi=psi+vac)
  return (psi-eq.plasma_psi).ravel()
 solution=newton_krylov(residual,initial.ravel(),f_tol=2e-7,maxiter=65,rdiff=1e-5)
 error=float(np.max(np.abs(residual(solution))));assert error<2e-6
 assert np.array_equal(fixed,[c.current for _,c in eq.tokamak.coils]),'Forward solve changed currents'
 return error

def export(name,value,error):
 psi=eq.psi();axis=list(map(float,eq.magneticAxis()));boundary=float(eq.psi_bndry)
 op,xp=freegs.critical.find_critical(eq.R,eq.Z,psi);xp=[list(map(float,x)) for x in xp if abs(x[2]-boundary)<abs(boundary-axis[2])*.002]
 if not xp or xp[0][1]>0:raise RuntimeError('Expected lower null '+name)
 dr=eq.R[1,0]-eq.R[0,0];dz=eq.Z[0,1]-eq.Z[0,0]
 lap=(psi[2:,1:-1]-2*psi[1:-1,1:-1]+psi[:-2,1:-1])/dr**2-(psi[2:,1:-1]-psi[:-2,1:-1])/(2*dr*eq.R[1:-1,1:-1])+(psi[1:-1,2:]-2*psi[1:-1,1:-1]+psi[1:-1,:-2])/dz**2
 rhs=-MU*eq.R[1:-1,1:-1]*eq.Jtor[1:-1,1:-1];mask=(eq.mask[1:-1,1:-1]>.9)&(eq.psiN()[1:-1,1:-1]<.85)
 residual=float(np.linalg.norm((lap-rhs)[mask])/np.linalg.norm(rhs[mask]));assert residual<.025,(name,residual)
 def flat(x):return np.round(x,8).flatten().tolist()
 v=np.linspace(0,1,101)
 return dict(id=name,control=value,psi=flat(psi),axis=axis,boundary=boundary,xpoints=xp,p=flat(eq.pressure(v)),f=flat(eq.fpol(v)),j=flat(eq.Jtor),mask=np.round(eq.mask).astype(int).flatten().tolist(),currents=[float(c.current) for _,c in eq.tokamak.coils],ip=float(eq.plasmaCurrent()),paxis=float(eq.pressure(0.)),residual=residual,forwardResidual=error)

# Independently drawn engineering envelope. Not redistributed ITER STL/CAD.
# Rounded D section; lower targets and dome form a separate divertor assembly.
wall=[[3.45,-4.6],[3.8,-2.8],[3.75,-1.1],[3.75,1.3],[3.95,2.8],[4.5,3.8],[5.4,4.35],[6.45,4.25],[7.5,3.65],[8.4,2.65],[8.85,1.2],[8.95,-.3],[8.65,-1.9],[7.85,-3.4],[6.8,-4.85],[5.4,-5.65],[4.15,-5.5]]
wall_control=wall
def smooth_wall(points):
 out=[];n=len(points)
 for i in range(n):
  for j in range(8):
   t=j/8;a,b,c,d=[np.array(points[k%n]) for k in [i-1,i,i+1,i+2]]
   out.append((.5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t)).tolist())
 return out
wall=smooth_wall(wall)
data=dict(schema=2,solver='FreeGS 0.8.2 + SciPy Newton-Krylov',grid=G,machine=dict(name='ITER – výuková rovnováha',coils=COILS,wall=wall,wallControl=wall_control,targetZ=-4.25,targetProfiles=[[[4.18,-3],[4.1607199999999995,-3.0307999999999997],[4.13256,-3.0724],[4.10104,-3.1236],[4.071680000000001,-3.1832000000000003],[4.05,-3.25],[4.036639999999999,-3.3270399999999998],[4.027919999999999,-3.4151200000000004],[4.02288,-3.50968],[4.02056,-3.60616],[4.02,-3.7],[4.020879999999999,-3.7929600000000003],[4.023839999999999,-3.8880800000000004],[4.02936,-3.9827200000000005],[4.03792,-4.0742400000000005],[4.05,-4.16],[4.064800000000001,-4.2401599999999995],[4.082,-4.316479999999999],[4.102799999999999,-4.388719999999999],[4.128399999999999,-4.456639999999999],[4.16,-4.52],[4.20352,-4.58104],[4.25816,-4.639919999999999],[4.315040000000001,-4.693279999999999],[4.36528,-4.73776],[4.4,-4.77]],[[5.4,-4.8],[5.435920000000001,-4.780239999999999],[5.48776,-4.75432],[5.546640000000001,-4.721279999999999],[5.603680000000001,-4.68016],[5.65,-4.63],[5.685440000000001,-4.56776],[5.715920000000001,-4.494079999999999],[5.741680000000001,-4.41352],[5.762960000000002,-4.33064],[5.78,-4.25],[5.7888,-4.17],[5.7892,-4.0876],[5.7872,-4.0052],[5.788799999999999,-3.9252000000000002],[5.8,-3.85],[5.82016,-3.7770400000000004],[5.845279999999999,-3.70472],[5.876320000000001,-3.6368799999999997],[5.91424,-3.5773599999999997],[5.96,-3.53],[6.02192,-3.4973599999999996],[6.09936,-3.4768799999999995],[6.1798399999999996,-3.46472],[6.2508799999999995,-3.45704],[6.3,-3.45]]],dome=[[4.45,-4.76],[4.46656,-4.732559999999999],[4.48928,-4.692880000000001],[4.51672,-4.647920000000001],[4.547440000000001,-4.604640000000001],[4.58,-4.57],[4.615360000000001,-4.5440000000000005],[4.65448,-4.522],[4.695920000000001,-4.5040000000000004],[4.73824,-4.49],[4.78,-4.48],[4.821680000000001,-4.474],[4.86424,-4.472],[4.906960000000001,-4.474],[4.949119999999999,-4.48],[4.99,-4.49],[5.03008,-4.50448],[5.06984,-4.52344],[5.10856,-4.5461599999999995],[5.145519999999999,-4.5719199999999995],[5.18,-4.6],[5.21344,-4.634399999999999],[5.24632,-4.675599999999999],[5.276479999999999,-4.717599999999999],[5.30176,-4.7543999999999995],[5.32,-4.78]],cassette={"rail":[[3.92,-3.1],[3.8963999999999994,-3.1692000000000005],[3.8612,-3.2636000000000003],[3.8227999999999995,-3.3784],[3.789599999999999,-3.5088],[3.77,-3.65],[3.7619199999999995,-3.81288],[3.75976,-4.000640000000001],[3.7666399999999998,-4.19696],[3.7856799999999997,-4.385519999999999],[3.82,-4.55],[3.8705600000000002,-4.69136],[3.9352799999999997,-4.820479999999999],[4.012720000000001,-4.93592],[4.10144,-5.03624],[4.2,-5.12],[4.31112,-5.184800000000001],[4.43576,-5.231600000000001],[4.569840000000001,-5.264],[4.709280000000001,-5.2856],[4.85,-5.3],[4.998719999999999,-5.30704],[5.15816,-5.304320000000001],[5.318239999999999,-5.29208],[5.468879999999999,-5.27056],[5.6,-5.24],[5.71192,-5.2032799999999995],[5.81136,-5.160239999999999],[5.8978399999999995,-5.10656],[5.970879999999999,-5.03792],[6.03,-4.95],[6.07056,-4.83464],[6.092880000000001,-4.69472],[6.10392,-4.542480000000001],[6.11064,-4.390160000000001],[6.12,-4.25],[6.13184,-4.114],[6.141520000000001,-3.9739999999999998],[6.14928,-3.8419999999999996],[6.15536,-3.73],[6.16,-3.65]],"supports":[[[4.65,-5.23],[4.79,-4.63]],[[5.12,-5.27],[4.98,-4.63]]],"thickness":0.16},targets=[[[4.18,-3],[4.4,-4.77]],[[5.4,-4.8],[6.3,-3.45]]],R0=6.2,a=2.,bt=5.3),series={},referenceCurrents=currents.tolist(),scales=dict(p=700000,bp=2.5,b=9.,bt=9.,j=5e6,pm=33e6,beta=15.,flux=1.15,current=20e6),metadata=dict(currentMode='one-coil-at-a-time-fixed-others',fieldCoils='thin circular equivalent at published coil centres',pressurePa=500000,ipA=15000000,notDischarge=True))
start=time.time();baseline=export('reference',0,forward(reference,5e5));reference=eq.plasma_psi.copy();data['reference']=baseline
checkpoint=ROOT/'tmp/iter-forward-checkpoints';checkpoint.mkdir(exist_ok=True)
if a.steering_only:
 old=(ROOT/'versions/vyvoj/m_files/fusion/equilibrium/data.js').read_text(encoding='utf8')
 data=json.loads(old.split('window.TokamakData=',1)[1].rsplit(';',1)[0])
 assert np.max(np.abs(currents-np.array(data['referenceCurrents'])))<1
for group in ([] if a.steering_only else [c[0] for c in COILS[:6]]+['pressure']):
 states=[]
 for k in range(9):
  saved=checkpoint/(group+str(k)+'.json')
  if a.resume and saved.exists():
   previous=json.loads(saved.read_text(encoding='utf8'));assert len(previous['psi'])==a.n*a.n;states.append(previous);continue
  for (_,coil),I in zip(eq.tokamak.coils,currents):coil.current=float(I)
  value=(k-4)*150000 if group!='pressure' else 350000+k*37500
  if group!='pressure':eq.tokamak[group].current+=value
  pressure=value if group=='pressure' else 500000
  error=forward(reference,pressure);s=export(group+str(k),value,error);states.append(s)
  (checkpoint/(s['id']+'.json')).write_text(json.dumps(s,separators=(',',':')),encoding='utf8')
  print(group,k,'axis',np.round(s['axis'][:2],4),'residual',round(s['residual'],6),'elapsed',round(time.time()-start),flush=True)
 data['series'][group]=states
# Open-loop current patterns chosen once from reference small-signal response.
# No position measurement or iterative correction modifies a coil current.
data['steering']={}
for name,pair,target in [('vertical',['PF2','PF5'],[0,.35]),('radial',['PF3','PF4'],[.30,0])]:
 response=np.array([[(data['series'][c][-1]['axis'][axis]-data['series'][c][0]['axis'][axis])/1200000 for c in pair] for axis in [0,1]])
 gains=np.linalg.solve(response,np.array(target));weights=np.zeros(len(COILS))
 for coil,gain in zip(pair,gains):weights[[c[0] for c in COILS].index(coil)]=gain
 data['steering'][name]=dict(coils=pair,weights=weights.tolist(),referenceTarget=target)
 states=[]
 for k in range(17):
  value=(k-8)/8
  for (_,coil),I,gain in zip(eq.tokamak.coils,currents,weights):coil.current=float(I+value*gain)
  error=forward(reference,500000);state=export(name+str(k),value,error);states.append(state)
  print(name,k,'axis',np.round(state['axis'][:2],4),'delta cm',np.round((np.array(state['axis'][:2])-np.array(data['reference']['axis'][:2]))*100,1),flush=True)
 data['series'][name]=states
data['metadata']['currentMode']='open-loop-steering-or-one-coil-fixed-others'
out=ROOT/'versions/vyvoj/m_files/fusion/equilibrium/data.js'
out.write_text('/* Fixed-current static GS solutions. Rebuild only on request; see tools/precompute-tokamak-equilibrium.py. */\nwindow.TokamakData='+json.dumps(data,separators=(',',':'),allow_nan=False)+';\n',encoding='utf8')
print('Wrote',out.stat().st_size,'bytes',flush=True)
