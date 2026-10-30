import React from 'react';
import {SourceNote} from './SourceNote.jsx';
import './destination-introduction.css';

export function DestinationIntroduction({destination}){
 const profile=destination?.profile;if(!profile)return null;
 return <section className="destination-introduction" aria-label={destination.name+'目的地介绍'}><div className="destination-introduction-heading"><h3>认识{destination.name}</h3><SourceNote label={destination.name+'背景资料'} sources={profile.sources}/></div><p className="destination-kind">{profile.placeType}</p><p>{profile.intro}</p><p>{profile.meaning}</p><div className="destination-story-list">{profile.stories.map(story=><article key={story.title}><h4>{story.title}</h4><p>{story.text}</p></article>)}</div></section>;
}
