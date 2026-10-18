import topology from './world.json' with {type:'json'};
import countries from './country-labels.json' with {type:'json'};
import continents from './continent-labels.json' with {type:'json'};
import cities from './city-labels.json' with {type:'json'};

export const geographicLabels=[
 ...continents.map(d=>({...d,id:'continent-'+d.id,type:'continent',minZoom:.72})),
 ...countries.map(d=>({...d,id:'country-'+d.id,countryId:d.id,type:'country',minZoom:d.area>.035?.72:d.area>.007?1:d.area>.0015?1.45:1.95})),
 ...cities.map(d=>({...d,id:'city-'+d.id,type:'city',minZoom:.95}))
];
export function decodedBorderArcs(){const {scale,translate}=topology.transform;return topology.arcs.map(arc=>{let x=0,y=0;return arc.map(p=>{x+=p[0];y+=p[1];return[x*scale[0]+translate[0],y*scale[1]+translate[1]];});});}
const arcs=decodedBorderArcs();
export function earthTextureWithBorders(image,maxTextureSize=4096){
 const width=Math.min(4096,maxTextureSize),height=width/2,canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0,width,height);
 ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();
 for(const arc of arcs){let previous=null;for(const [lon,lat]of arc){const x=(lon+180)/360*width,y=(90-lat)/180*height;if(!previous||Math.abs(lon-previous[0])>180)ctx.moveTo(x,y);else ctx.lineTo(x,y);previous=[lon,lat];}}
 ctx.strokeStyle='rgba(20,38,50,.25)';ctx.lineWidth=width/2048*1.5;ctx.stroke();ctx.strokeStyle='rgba(235,242,239,.78)';ctx.lineWidth=width/4096*1.35;ctx.stroke();return canvas;
}
