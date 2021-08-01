const MQTT = require("async-mqtt");

run()

async function run() {
    const client = await MQTT.connectAsync("tcp://test.mosquitto.org:1883")

    console.log("Starting");
    try {
        await client.subscribe("aerlapak");
        client.on('message', (topic, message) => console.log(topic, message.toString()))
            // This line doesn't run until the server responds to the publish

        // This line doesn't run until the client has disconnected without error
        console.log("Done");
    } catch (e) {
        // Do something about it!
        console.log(e.stack);
        process.exit();
    }
}