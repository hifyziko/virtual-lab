/* Local normalized poloidal flux. Match the midplane edges and the horizontal
   tangent at the requested upper extremum of the boundary. */
function shapingModel(kappa, delta) {
  const top = -delta, height2 = kappa ** 2;
  const a = (top ** 2 - height2 - 1) / 2;
  const b = (top ** 3 - 3 * top * height2 - top) / 3;
  const c = (1 - top ** 2 - height2) / 2;
  const f = top ** 2 - height2 - 1 / 3;
  const determinant = a * f - b * top;
  const Q = (c * f + b * top) / determinant;
  const H = -top * (a + c) / determinant;
  const axis = (2 * H / 3) / (1 + Q + Math.sqrt((1 + Q) ** 2 + 4 * H ** 2 / 3));
  const flux = (x,z) => ((1+Q)*x*x + (1-Q)*z*z)/2 + H*(x*x*x-3*x*z*z-x)/3;
  const field = (x,z) => [-(1-Q)*z+2*H*x*z, (1+Q)*x+H*(x*x-z*z-1/3)];
  const span = flux(1,0) - flux(axis,0);
  function contour(fraction, count=288) {
    return Array.from({length:count}, (_,i) => {
      const angle = i*2*Math.PI/count, u = Math.cos(angle), v = Math.sin(angle);
      // Along each ray from the axis the flux increment is quadratic + cubic.
      const quadratic = ((1+Q+2*H*axis)*u*u + (1-Q-2*H*axis)*v*v)/2;
      const cubic = H*(u*u*u-3*u*v*v)/3;
      let lo = 0, hi = cubic < 0 ? Math.min(4,-2*quadratic/(3*cubic)) : 4;
      for (let j=0;j<32;j++) {
        const r = (lo+hi)/2;
        if (r*r*(quadratic+cubic*r) < span*fraction*fraction) lo=r;
        else hi=r;
      }
      return [axis+u*hi,v*hi];
    });
  }
  return {field,flux,contour,axis,Q,H};
}

// Each location represents two straight toroidal conductors mirrored in Z.
// Expand log|w-c| around w=0. The coefficient of Re(w^n) from a pair
// carrying unit current is -2 Re(c^-n)/n. Match orders 1 through 4.
const shapingCoilPairs = [[-1.56,1.48],[1.56,1.48],[-.79,2.15],[.79,2.15]];
function shapingCoilCurrents(model, plasmaRatio, areaRatio) {
  const coefficient=(pair,n)=>{
    const [x,z]=shapingCoilPairs[pair];
    return -2*Math.cos(n*Math.atan2(z,x))/(n*Math.hypot(x,z)**n);
  };
  // Mirror pairs in X add for even orders and subtract for odd orders.
  function solvePair(n, first, second) {
    const a=coefficient(1,n), b=coefficient(3,n);
    const c=coefficient(1,n+2), d=coefficient(3,n+2);
    return [(first*d-b*second)/(a*d-b*c),(a*second-first*c)/(a*d-b*c)];
  }
  const sums=solvePair(2,model.Q/2,0);
  const differences=solvePair(1,-model.H/3,model.H/3);
  return shapingCoilPairs.map((_,i)=>{
    const group=Math.floor(i/2), sign=i%2===0?-1:1;
    return (sums[group]+sign*differences[group])*plasmaRatio/(2*areaRatio);
  });
}

function shapingGeometry(points) {
  let twiceArea=0, moment=0;
  points.forEach(([x,z],i) => {
    const [nextX,nextZ]=points[(i+1)%points.length];
    const cross=x*nextZ-nextX*z;
    twiceArea+=cross;
    moment+=(x+nextX)*cross;
  });
  const area=twiceArea/2, centroid=moment/(3*twiceArea);
  return {areaRatio:area/Math.PI,volumeRatio:area*(3.3+centroid)/(3.3*Math.PI)};
}
/* Fraction of the poloidal cross section at R < R0. Clip each polygon edge
   against x = 0 before integrating area by the shoelace formula. */
function innerAreaFraction(points) {
  const inner=[];
  points.forEach((end,i)=>{
    const start=points[(i+points.length-1)%points.length];
    if ((start[0]<0)!==(end[0]<0)) {
      const t=-start[0]/(end[0]-start[0]);
      inner.push([0,start[1]+t*(end[1]-start[1])]);
    }
    if(end[0]<0) inner.push(end);
  });
  return shapingGeometry(inner).areaRatio/shapingGeometry(points).areaRatio;
}
