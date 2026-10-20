export function helpPlacement(anchor,viewport,popup={width:310,height:170}){
 const margin=12,width=Math.min(popup.width,viewport.width-margin*2),maxHeight=Math.max(80,viewport.height-margin*2),height=Math.min(popup.height,maxHeight);
 const left=Math.max(margin,Math.min(anchor.right-width,viewport.width-width-margin));
 const below=anchor.bottom+8,above=anchor.top-height-8;
 const top=below+height<=viewport.height-margin?below:above>=margin?above:Math.max(margin,Math.min(below,viewport.height-height-margin));
 return{left,top,width,maxHeight};
}
