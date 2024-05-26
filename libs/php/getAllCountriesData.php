<?php

$result = file_get_contents('../../countryBorders.geo.json');

echo "RESULT:" . $result;
// develop two PHP routines that return subsets of the file contents; 
// one to return a JSON object that contains just the codes and names to populate the select and 
// the other to return just the feature for the selected country so that it can be plotted on the map with L.geoJSON()

$decode = json_decode($result, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $decode['geonames'];

header('Content-Type: application/json; charset=UTF-8');

// echo json_encode($output);

?>