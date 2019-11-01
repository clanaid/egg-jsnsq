#!/bin/bash

curl -o nsq.tar.gz https://s3.amazonaws.com/bitly-downloads/nsq/nsq-1.2.0.linux-amd64.go1.12.9.tar.gz

tar -zxvf nsq.tar.gz

./nsq-1.2.0.linux-amd64.go1.12.9/bin/nsqlookupd &
./nsq-1.2.0.linux-amd64.go1.12.9/bin/nsqd -lookupd-tcp-address=127.0.0.1:4160 -broadcast-address=127.0.0.1 &