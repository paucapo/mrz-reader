<?php

$str = 'export default {';
foreach (glob(__DIR__ . '/templates/*.gif') as $image)
{
	$character = basename($image, '.gif');
	if ($character == 'LT')
	{
		$character = '<';
	}

	$img = imagecreatefromgif($image);

	$width = imagesx($img);
	$height = imagesy($img);

	$str .= '\'' . $character . '\':[';

	for ($y = 0; $y < $height; $y++)
	{
		$str .= '[';
		for ($x = 0; $x < $width; $x++)
		{
			$rgb = imagecolorat($img, $x, $y);
			$str .= $rgb . ',';
		}
		$str .= '],';
	}
	$str .= '],';
}
$str .= '};';

$str = str_replace(',]', ']', $str);
$str = str_replace(',}', '}', $str);

echo $str;
