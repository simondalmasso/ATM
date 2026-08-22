export const CANONICAL_OWNER="0xd89Ef03bC3105C538529AC2657Bc4488c94ff4E4";
export const CANONICAL_ORIGIN="https://atm.simondalmasso44.workers.dev";
export const CHAIN_ID=8453;
const MASK=(1n<<64n)-1n;
const RC=[1n,0x8082n,0x800000000000808an,0x8000000080008000n,0x808bn,0x80000001n,0x8000000080008081n,0x8000000000008009n,0x8an,0x88n,0x80008009n,0x8000000an,0x8000808bn,0x800000000000008bn,0x8000000000008089n,0x8000000000008003n,0x8000000000008002n,0x8000000000000080n,0x800an,0x800000008000000an,0x8000000080008081n,0x8000000000008080n,0x80000001n,0x8000000080008008n];
const ROT=[[0,36,3,41,18],[1,44,10,45,2],[62,6,43,15,61],[28,55,25,21,56],[27,20,39,8,14]];
const P=0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2fn;
const N=0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141n;
const GX=0x79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798n;
const GY=0x483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8n;
const INF=[0n,1n,0n];
const utf8=x=>new TextEncoder().encode(String(x));
const hex=b=>"0x"+[...b].map(x=>x.toString(16).padStart(2,"0")).join("");
const unhex=x=>{const s=String(x).replace(/^0x/,"");if(s.length%2)throw Error("hex_length_invalid");const b=new Uint8Array(s.length/2);for(let i=0;i<b.length;i++){const v=parseInt(s.slice(i*2,i*2+2),16);if(!Number.isFinite(v))throw Error("hex_invalid");b[i]=v}return b};
const cat=(...p)=>{const b=new Uint8Array(p.reduce((n,x)=>n+x.length,0));let o=0;for(const x of p){b.set(x,o);o+=x.length}return b};
const rol=(x,n)=>n?((x<<BigInt(n))|(x>>(64n-BigInt(n))))&MASK:x&MASK;
function f(s){for(let r=0;r<24;r++){const c=[],d=[],b=new Array(25).fill(0n);for(let x=0;x<5;x++)c[x]=s[x]^s[x+5]^s[x+10]^s[x+15]^s[x+20];for(let x=0;x<5;x++)d[x]=c[(x+4)%5]^rol(c[(x+1)%5],1);for(let x=0;x<5;x++)for(let y=0;y<5;y++)s[x+5*y]=(s[x+5*y]^d[x])&MASK;for(let x=0;x<5;x++)for(let y=0;y<5;y++)b[y+5*((2*x+3*y)%5)]=rol(s[x+5*y],ROT[x][y]);for(let x=0;x<5;x++)for(let y=0;y<5;y++)s[x+5*y]=(b[x+5*y]^((~b[(x+1)%5+5*y])&b[(x+2)%5+5*y]))&MASK;s[0]^=RC[r]}}
export function keccak256Bytes(v){const data=v instanceof Uint8Array?v:utf8(v),rate=136,n=Math.ceil((data.length+1)/rate)*rate,buf=new Uint8Array(n),s=new Array(25).fill(0n);buf.set(data);buf[data.length]^=1;buf[n-1]^=128;for(let o=0;o<n;o+=rate){for(let i=0;i<17;i++){let q=0n;for(let j=0;j<8;j++)q|=BigInt(buf[o+i*8+j])<<(8n*BigInt(j));s[i]^=q}f(s)}const out=new Uint8Array(32);for(let i=0;i<32;i++)out[i]=Number((s[i>>3]>>(8n*BigInt(i&7)))&255n);return out}
export const keccak256Hex=v=>hex(keccak256Bytes(v));
const u256=v=>{let x=BigInt(v);if(x<0n||x>=(1n<<256n))throw Error("u256_invalid");const b=new Uint8Array(32);for(let i=31;i>=0;i--){b[i]=Number(x&255n);x>>=8n}return b};
const hs=v=>keccak256Bytes(utf8(v));
const DTH=keccak256Bytes("EIP712Domain(string name,string version,uint256 chainId,bytes32 salt)");
const ATH=keccak256Bytes("OwnerAction(string requestId,string action,bytes32 nonce,uint256 expiresAt,string origin)");
const SALT=keccak256Hex(CANONICAL_ORIGIN);
export function ownerTypedData({requestId,action,nonce,expiresAt}){if(!/^0x[0-9a-fA-F]{64}$/.test(String(nonce)))throw Error("nonce_invalid");return {types:{EIP712Domain:[{name:"name",type:"string"},{name:"version",type:"string"},{name:"chainId",type:"uint256"},{name:"salt",type:"bytes32"}],OwnerAction:[{name:"requestId",type:"string"},{name:"action",type:"string"},{name:"nonce",type:"bytes32"},{name:"expiresAt",type:"uint256"},{name:"origin",type:"string"}]},primaryType:"OwnerAction",domain:{name:"ATM Human Gate",version:"1",chainId:CHAIN_ID,salt:SALT},message:{requestId:String(requestId),action:String(action),nonce:String(nonce),expiresAt:Number(expiresAt),origin:CANONICAL_ORIGIN}}}
export function eip712Digest(a){const t=ownerTypedData(a),ds=keccak256Bytes(cat(DTH,hs(t.domain.name),hs(t.domain.version),u256(t.domain.chainId),unhex(t.domain.salt))),ms=keccak256Bytes(cat(ATH,hs(t.message.requestId),hs(t.message.action),unhex(t.message.nonce),u256(t.message.expiresAt),hs(t.message.origin)));return keccak256Hex(cat(new Uint8Array([25,1]),ds,ms))}
const mod=(x,m=P)=>{const r=x%m;return r<0n?r+m:r};
function invMod(a,m){let x=mod(a,m);if(x===0n)throw Error("inverse_zero");let b=m,u=1n,v=0n;while(x!==0n){const q=b/x;[b,x]=[x,b-q*x];[v,u]=[u,v-q*u]}if(b!==1n)throw Error("inverse_invalid");return mod(v,m)}
function powMod(base,exp,m){let b=mod(base,m),e=BigInt(exp),r=1n;while(e>0n){if(e&1n)r=mod(r*b,m);b=mod(b*b,m);e>>=1n}return r}
const isInf=p=>p[2]===0n;
function jacDouble(p){if(isInf(p)||p[1]===0n)return INF;const [X,Y,Z]=p,A=mod(X*X),B=mod(Y*Y),C=mod(B*B),D=mod(2n*(mod((X+B)*(X+B))-A-C)),E=mod(3n*A),F=mod(E*E),X3=mod(F-2n*D),Y3=mod(E*(D-X3)-8n*C),Z3=mod(2n*Y*Z);return [X3,Y3,Z3]}
function jacAdd(p,q){if(isInf(p))return q;if(isInf(q))return p;const [X1,Y1,Z1]=p,[X2,Y2,Z2]=q,Z1Z1=mod(Z1*Z1),Z2Z2=mod(Z2*Z2),U1=mod(X1*Z2Z2),U2=mod(X2*Z1Z1),S1=mod(Y1*Z2*Z2Z2),S2=mod(Y2*Z1*Z1Z1);if(U1===U2)return S1===S2?jacDouble(p):INF;const H=mod(U2-U1),I=mod((2n*H)*(2n*H)),J=mod(H*I),R=mod(2n*(S2-S1)),V=mod(U1*I),X3=mod(R*R-J-2n*V),Y3=mod(R*(V-X3)-2n*S1*J),Z3=mod((mod((Z1+Z2)*(Z1+Z2))-Z1Z1-Z2Z2)*H);return [X3,Y3,Z3]}
function jacMul(k,point){let n=mod(BigInt(k),N),r=INF,a=[point[0],point[1],1n];while(n>0n){if(n&1n)r=jacAdd(r,a);a=jacDouble(a);n>>=1n}return r}
function affine(p){if(isInf(p))throw Error("recover_infinity");const zi=invMod(p[2],P),z2=mod(zi*zi),x=mod(p[0]*z2),y=mod(p[1]*z2*zi);return [x,y]}
function signatureParts(signature){if(!/^0x[0-9a-fA-F]{130}$/.test(String(signature)))throw Error("signature_shape_invalid");const s=String(signature).slice(2),r=BigInt("0x"+s.slice(0,64)),ss=BigInt("0x"+s.slice(64,128));let v=parseInt(s.slice(128),16);if(v===27||v===28)v-=27;else if(v!==0&&v!==1)throw Error("signature_v_invalid");if(r<=0n||r>=N||ss<=0n||ss>=N)throw Error("signature_scalar_invalid");return {r,s:ss,recid:v}}
export function ecrecoverCallData(digest,signature){if(!/^0x[0-9a-fA-F]{64}$/.test(String(digest)))throw Error("digest_shape_invalid");const {r,s,recid}=signatureParts(signature);return "0x"+String(digest).slice(2)+(27+recid).toString(16).padStart(64,"0")+r.toString(16).padStart(64,"0")+s.toString(16).padStart(64,"0")}
export function recoverAddressFromDigest(digest,signature){if(!/^0x[0-9a-fA-F]{64}$/.test(String(digest)))throw Error("digest_shape_invalid");const {r,s,recid}=signatureParts(signature),x=r;if(x>=P)throw Error("recover_x_invalid");const y2=mod(mod(x*x)*x+7n),root=powMod(y2,(P+1n)>>2n,P);if(mod(root*root)!==y2)throw Error("recover_point_invalid");const y=Number(root&1n)===recid?root:mod(-root),R=[x,y],rinv=invMod(r,N),e=BigInt(digest),u1=mod(-e*rinv,N),u2=mod(s*rinv,N),Q=affine(jacAdd(jacMul(u1,[GX,GY]),jacMul(u2,R)));if(mod(Q[1]*Q[1])!==mod(mod(Q[0]*Q[0])*Q[0]+7n))throw Error("recover_pubkey_invalid");const pub=cat(u256(Q[0]),u256(Q[1])),h=keccak256Bytes(pub);return hex(h.slice(12))}
export async function recoverOwnerAddress(args,signature){return recoverAddressFromDigest(eip712Digest(args),signature)}
export const sameOwner=a=>String(a||"").toLowerCase()===CANONICAL_OWNER.toLowerCase();
export async function sha256Hex(v){return hex(new Uint8Array(await crypto.subtle.digest("SHA-256",v instanceof Uint8Array?v:utf8(v))))}
