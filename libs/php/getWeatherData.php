<?php

// remove for production

ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);


// NOTE: longitude param is called lon in thi API
// example URL: https://api.openweathermap.org/data/2.5/weather?appid=cabebd5bf39ecdc54982ba9d45841f89&units=metric&lat=37.98381&lon=23.727539
$url = 'https://api.openweathermap.org/data/2.5/weather?appid=cabebd5bf39ecdc54982ba9d45841f89&units=metric&lat=' . $_REQUEST['lat'] . '&lon=' . $_REQUEST['lng'];

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$resultJson = curl_exec($ch);

curl_close($ch);

$decodedData = json_decode($resultJson, true);

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";

$output['data']['weather'] = $decodedData['weather'];
$output['data']['main'] = $decodedData['main'];
$output['data']['wind'] = $decodedData['clouds']['all'];
$output['data']['sunrise'] = $decodedData['sys']['sunrise'];
$output['data']['sunset'] = $decodedData['sys']['sunset'];


header('Content-Type: application/json; charset=UTF-8');

echo json_encode($output);