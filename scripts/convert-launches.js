const fs = require('fs');

const input = JSON.parse(fs.readFileSync('./scripts/launches.json', 'utf8'));

const launches = input.results
  .filter(l => l.launch_service_provider?.name === 'SpaceX')
  .map(l => ({
    id: l.id,
    name: l.name,
    details: l.mission?.description ?? null,
    date_utc: l.net,
    success:
      l.status?.name === 'Launch Successful'
        ? true
        : l.status?.name === 'Launch Failure'
        ? false
        : null,

    rocket: l.rocket?.configuration?.full_name ?? '',

    links: {
      patch: {
        small: l.image?.thumbnail_url ??
               l.image?.image_url ??
               null
      },
      wikipedia:
        l.launch_service_provider?.wiki_url ??
        null,

      webcast:
        l.mission?.vid_urls?.[0] ??
        null
    }
  }));

fs.writeFileSync(
  './src/assets/data/launches.json',
  JSON.stringify(launches, null, 2)
);

console.log('✅ launches.json generado');
