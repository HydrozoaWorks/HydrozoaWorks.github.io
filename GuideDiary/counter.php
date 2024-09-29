<?php
$file = 'counter.txt';

// 如果文件不存在，创建并初始化为0
if (!file_exists($file)) {
    file_put_contents($file, '0');
}

// 读取当前的计数值
$counter = file_get_contents($file);

// 递增计数
$counter++;

// 将新的计数值写回文件
file_put_contents($file, $counter);


?>
