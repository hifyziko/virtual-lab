"""Rebuild the compact teaching atlas, explicitly: python tools/precompute-tokamak-equilibrium.py --write.
Install tools/tokamak-requirements.txt in a local virtual environment first.
Not part of the web build. FreeGS solves the free-boundary equilibrium offline.
"""
import os, sys, json, pathlib, time, argparse
ROOT=pathlib.Path(__file__).resolve().parents[1]
os.environ.setdefault('MPLBACKEND','Agg')
os.environ.setdefault('MPLCONFIGDIR',str(ROOT/'tmp'/'mplconfig'))
parser=argparse.ArgumentParser();parser.add_argument('--write',action='store_true');parser.add_argument('--deps');parser.add_argument('--n',type=int,default=129)
args=parser.parse_args()
if not args.write: parser.error('Use --write to explicitly regenerate the atlas.')
if args.deps: sys.path.insert(0,args.deps)
import freegs, numpy as np
from freegs.machine import Coil,Machine
COILS=[('P1U',.72,.72),('P1L',.72,-.72),('P2U',1.35,.42),('P2L',1.35,-.42),('P3U',.36,.38),('P3L',.36,-.38)]
N=args.n;MU=4e-7*np.pi
def solve(pressure=7000,offset=0,height=.34,bottom=.45):
    eq=freegs.Equilibrium(tokamak=Machine([(name,Coil(r,z)) for name,r,z in COILS]),Rmin=.22,Rmax=1.52,Zmin=-.85,Zmax=.85,nx=N,ny=N,boundary=freegs.boundary.freeBoundaryHagenow)
    profiles=freegs.jtor.ConstrainPaxisIp(eq,pressure,200000,.89)
    x=(.80,-bottom+offset)
    control=freegs.control.constrain(xpoints=[x],isoflux=[(*x,.62,offset),(*x,1.16,offset),(*x,.85,height+offset)],gamma=1e-12)
    freegs.solve(eq,profiles,control,rtol=2e-6,maxits=150)
    return eq
def export(eq,name,control):
    psi=eq.psi();op,xp=freegs.critical.find_critical(eq.R,eq.Z,psi)
    axis=op[0];boundary=float(eq.psi_bndry)
    active=[p for p in xp if abs(p[2]-boundary)<abs(boundary-axis[2])*.002]
    if not active or active[0][1]>0: raise RuntimeError('Expected lower single-null boundary: '+name)
    dr=eq.R[1,0]-eq.R[0,0];dz=eq.Z[0,1]-eq.Z[0,0]
    lap=(psi[2:,1:-1]-2*psi[1:-1,1:-1]+psi[:-2,1:-1])/dr**2-(psi[2:,1:-1]-psi[:-2,1:-1])/(2*dr*eq.R[1:-1,1:-1])+(psi[1:-1,2:]-2*psi[1:-1,1:-1]+psi[1:-1,:-2])/dz**2
    rhs=-MU*eq.R[1:-1,1:-1]*eq.Jtor[1:-1,1:-1]
    mask=(eq.mask[1:-1,1:-1]>.9)&(eq.psiN()[1:-1,1:-1]<.85)
    residual=float(np.linalg.norm((lap-rhs)[mask])/np.linalg.norm(rhs[mask]))
    if residual>.04: raise RuntimeError('GS residual too large: '+str(residual))
    v=np.linspace(0,1,101)
    def flat(a):return np.round(a,9).flatten().tolist()
    return dict(id=name,control=control,psi=flat(psi),axis=list(map(float,axis)),boundary=boundary,xpoints=[list(map(float,p)) for p in active],p=flat(eq.pressure(v)),f=flat(eq.fpol(v)),mask=np.round(eq.mask).astype(int).flatten().tolist(),currents=[float(c.current) for _,c in eq.tokamak.coils],ip=float(eq.plasmaCurrent()),paxis=float(eq.pressure(0.)),residual=residual)
data=dict(schema=1,solver='FreeGS 0.8.2',grid=dict(n=N,rmin=.22,rmax=1.52,zmin=-.85,zmax=.85),machine=dict(coils=COILS,wall=[[.43,-.67],[.33,-.39],[.33,.4],[.55,.64],[1.12,.64],[1.32,.4],[1.39,0],[1.29,-.43],[1.23,-.67]],targetZ=-.62,targets=[[[.44,-.62],[.77,-.62]],[[.84,-.62],[1.28,-.62]]]),series={},scales=dict(p=19000,bp=.55,b=2.4,current=200000))
out=ROOT/'versions/vyvoj/m_files/fusion/equilibrium/data.js'
for group in ['pressure','position','shape']:
    data['series'][group]=[]
    for i in range(9):
        start=time.time()
        p=1000+i*2000 if group=='pressure' else 9000
        z=(i-4)*.012 if group=='position' else 0
        h=.30+i*.01 if group=='shape' else .34
        bottom=.41+i*.01 if group=='shape' else .45
        eq=solve(p,z,h,bottom)
        value=p if group=='pressure' else z if group=='position' else (h+bottom)/(.54)
        state=export(eq,group+str(i),value);data['series'][group].append(state)
        print(group,i,'axis',np.round(state['axis'][:2],5),'residual',round(state['residual'],5),'seconds',round(time.time()-start,1),flush=True)
        if group=='pressure' and i==4: eq.plot(show=False).figure.savefig(ROOT/'tmp'/'tokamak-baseline.png')
data['scales']['current']=float(np.ceil(max(abs(c) for states in data['series'].values() for s in states for c in s['currents'])/10000)*10000)
out.write_text('/* Precomputed free-boundary GS equilibria; see tools/precompute-tokamak-equilibrium.py. */\nwindow.TokamakData='+json.dumps(data,separators=(',',':'),allow_nan=False)+';\n',encoding='utf8')
print('Wrote',out,'bytes',out.stat().st_size,flush=True)
