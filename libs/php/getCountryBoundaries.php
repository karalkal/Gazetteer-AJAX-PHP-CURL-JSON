<?php

$executionStartTime = microtime(true);

$resultJson = file_get_contents('../../countryBorders.geo.json');
$countryCode = $_GET['countryCode'];

// develop two PHP routines that return subsets of the file contents; 
// one to return a JSON object that contains just the codes and names to populate the select and 
// the other to return just the feature for the selected country so that it can be plotted on the map with L.geoJSON()

$decodedDataArray = json_decode($resultJson, true);
// echo "\nDECODED:\n";
// print_r($decodedDataArray['features'][5]);

$coordinatesArray = [];
foreach ($decodedDataArray['features'] as $countryData) {
    if ($countryData['properties']['iso_a2'] === $countryCode) {
        // echo "SUCCESS!\n" . $countryCode . " === " . $countryData['properties']['iso_a2'] . " which is " . $countryData['properties']['name'] . "\n";
        $coordinatesArray = $countryData['geometry']['coordinates'];
        $geometryType = $countryData['geometry']['type'];
        break;
    }
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data']['coordinatesArray'] = $coordinatesArray;
$output['data']['geometryType'] = $geometryType;


header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);