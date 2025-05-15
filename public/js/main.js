

document.addEventListener('DOMContentLoaded', async function () {
  await updateGraphics();
});


async function updateGraphics() {
  try {
    const mapResponse = await fetch('/api/mapdata-or');
    const channelResponse = await fetch('/api/channeldata');
    const participationResponse = await fetch('/api/participationdata');
    const futureReachResponse = await fetch('/api/futurereachdata');
    const formatResponse = await fetch('/api/formatdata');
    const adResponse = await fetch('/api/addata');

    if (!mapResponse.ok || !channelResponse.ok
      || !participationResponse.ok || !futureReachResponse.ok || !formatResponse.ok || !adResponse.ok) {
      throw new Error('Network response was not ok');
    }

    const mapData = await mapResponse.json();
    const channelData = await channelResponse.json();
    const participationData = await participationResponse.json();
    const futureReachData = await futureReachResponse.json();
    const formatData = await formatResponse.json();
    const adData = await adResponse.json();


    updateDDMap(mapData);
    updatePieChart(channelData);
    updateBubbleMap(participationData);
    myWordCloud.update(prepareWords(formatData));
    updateBarplot(futureReachData);
    updateStackedBar(adData);




    window.addEventListener('resize', function () {
      myWordCloud.update(prepareWords(formatData));
    });


  } catch (error) {
    console.error("Failed to fetch data:", error);
  }
}


