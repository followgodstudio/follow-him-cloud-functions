#!/bin/bash
# kill the programs that are using some port
portkill () {
    port=$1
    echo "kill port: $port"
    lsof -i tcp:$port | grep LISTEN | awk '{print $2}' | xargs kill
}

portkill 8080
portkill 9000
portkill 5000
portkill 8085
portkill 5001
portkill 9099