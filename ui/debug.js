var data = {
    "job":[
            "police",
            "ambulance"
        ],
    "number":3747727153,
    "units":[],
    "dispatchMessage":"Incoming Call",
    "priority":2,
    "origin":{"x":507.4490966796875,"y":-2164.087158203125,"z":5.94245052337646},
    "dispatchCode":"911",
    "callId":1,
    "information":"test",
    "name":"Nicholas Ortiz",
    "firstStreet":"Dutch London St, Cypress Flats",
    "time":1674399134000,
    "dispatchcodename":"911call"
}

var id = 1

setTimeout(function() {
    $(`.dispatch-container`).append(`<button class="debug-button">SEND DISPATCH</button>`);
    $(`.debug-button`).click(function() {
        data.time = new Date();
        data.callId = id;
        addNewCall(id, 5000, data, true)
        id++;
    });
    // addNewCall(2, 5000, data, true)

    // addNewCall(3, 5000, data, true)
},500);
