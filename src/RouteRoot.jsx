import React,{useEffect,useLayoutEffect,useState,useSyncExternalStore} from 'react';
import {createNavigation} from './navigation.mjs';
import {createRouteLoader} from './route-loading.mjs';
import {LoadingPage} from './LoadingPage.jsx';
import {AnalyticsPrivacy} from './AnalyticsPrivacy.jsx';
import {WishlistToast} from './WishlistToast.jsx';
import {startAnalytics} from './analytics.mjs';

const loaders={home:()=>import('./App.jsx').then(module=>module.App),encyclopedia:()=>import('./Encyclopedia.jsx').then(module=>module.default),insights:()=>import('./Insights.jsx').then(module=>module.default)};

class PageBoundary extends React.Component{
 state={failed:false};
 static getDerivedStateFromError(){return{failed:true};}
 componentDidMount(){window.__SHANHE_STARTUP__?.ready();}
 render(){return this.state.failed?<LoadingPage route={this.props.route} status="error" onRetry={this.props.onRetry}/>:this.props.children;}
}

function Routes({route}){
 const [loader]=useState(()=>createRouteLoader(loaders)),state=useSyncExternalStore(loader.subscribe,loader.snapshot);
 useEffect(()=>{startAnalytics();loader.load(route.id,route.key);if(!route.hash)window.scrollTo(0,0);},[route.key]);
 useEffect(()=>()=>loader.dispose(),[loader]);
 const Page=state.Component,ready=state.status==='ready'&&state.key===route.key;
 return <>{ready?<PageBoundary key={route.key+':'+state.attempt} route={route.id} onRetry={loader.retry}><Page key={route.key}/></PageBoundary>:<LoadingPage route={route.id} status={state.key===route.key?state.status:'loading'} onRetry={loader.retry}/>}{ready&&route.id!=='insights'&&<><AnalyticsPrivacy/><WishlistToast key={route.key}/></>}</>;
}

export function RouteRoot(){
 const [navigation]=useState(()=>createNavigation()),route=useSyncExternalStore(navigation.subscribe,navigation.current);
 useLayoutEffect(()=>navigation.attach(),[navigation]);
 return <PageBoundary key={route.key} route={route.id} onRetry={()=>window.location.reload()}><Routes route={route}/></PageBoundary>;
}
