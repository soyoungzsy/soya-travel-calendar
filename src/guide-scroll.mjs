export function scrollGuideTo(id,{instant=false}={}){
 const target=document.getElementById('guide-'+id);if(!target)return;
 const dialog=target.closest('dialog');if(!dialog)return;
 const heading=dialog.querySelector('.dialog-top')?.offsetHeight||0,nav=dialog.querySelector('.guide-nav')?.offsetHeight||0;
 const top=dialog.scrollTop+target.getBoundingClientRect().top-dialog.getBoundingClientRect().top-heading-nav-16;
 dialog.scrollTo({top:Math.max(0,top),behavior:instant||matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
}
