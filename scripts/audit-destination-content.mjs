import {auditDestinationCoverage} from '../src/destination-coverage.mjs';
const audit=auditDestinationCoverage();
console.log(JSON.stringify({scope:'distributed-public-catalogue',sourceBodiesRechecked:false,criteria:{shortOverview:'fewer than 45 characters; editorial review flag only',reusesSeasonLead:'overview equals whyNow',background:'recorded profile stories or POI history fields, not a full semantic assessment'},...audit},null,2));
