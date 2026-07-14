const axios = require('axios');
const fs = require('fs');

const URL =
  'https://ll.thespacedevs.com/2.3.0/launches/upcoming/?limit=9';

async function generate() {
  try {
    const { data } = await axios.get(URL);

    const launches = data.results.map((launch) => ({
      id: launch.id,
      name: launch.name,
      details: launch.mission?.description ?? 'No description available.',
      date_utc: launch.net,
      success:
        launch.status?.name === 'Launch Successful'
          ? true
          : launch.status?.name === 'Launch Failure'
          ? false
          : null,

      rocket: launch.rocket?.configuration?.full_name ?? '',

      links: {
        patch: {
          small: launch.image || null
        },
        wikipedia:
          launch.infographic ||
          launch.vidURLs?.[0] ||
          null,
        webcast:
          launch.vidURLs?.[0] ||
          launch.webcast_live || null
      }
    }));

    fs.mkdirSync('./src/assets/data', { recursive: true });

    fs.writeFileSync(
      './src/assets/data/launches.json',
      JSON.stringify(launches, null, 2)
    );

    console.log('✅ launches.json generado');
  } catch (err) {
    console.error(err);
  }
}

generate();
