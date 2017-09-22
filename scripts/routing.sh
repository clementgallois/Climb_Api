sudo sh -c "echo "200 out" >>/etc/iproute2/rt_tables"
sudo ip route add default via 172.31.0.1 dev eth1 table out
ip rule add from 172.31.2.248/32 table out
sudo ip rule add from 172.31.2.248/32 table out
sudo ip rule add to 172.31.2.248/32 table out
sudo ip route flush cache
