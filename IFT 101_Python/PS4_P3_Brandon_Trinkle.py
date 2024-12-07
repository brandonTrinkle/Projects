'''
Name: Brandon Trinkle
Student ID: 1217455031
Course: IFT 101
Problem Set: PS4
Problem: P3
Date: 11/03/2023
'''

device_ip = ['192.168.1.1', '192.168.1.2', '192.168.1.3', '192.168.1.4', '192.168.1.5', '192.168.1.6','192.168.1.7','192.168.1.8']

print("List of IP Addresses:")
for ip in device_ip:
  print(ip)

device_mac = ('00:14:22:01:23:45', '00:14:22:01:23:46', '00:14:22:01:23:47', '00:14:22:01:23:48', '00:14:22:01:23:49', '00:14:22:01:23:50','00:14:22:01:23:51','00:14:22:01:23:52')

print("\nTuple of MAC Addresses:")
for mac in device_mac:
  print(mac)

device_type = {'router', 'switch', 'server', 'workstation', 'printer', 'mobile device'}

print("\nSet of Device Types:")
for device in device_type:
  print(device)

device_types = ['router', 'switch', 'switch', 'server', 'server', 'workstation', 'printer', 'mobile device'] 

network_inventory = {}
for i in range(len(device_ip)):
  network_inventory[device_ip[i]] = {'MAC': device_mac[i], 'Type': device_types[i]}
  
print("\nNetwork Inventory:")
for key, value in network_inventory.items():
    print(f"IP: {key}: MAC: {value['MAC']}, Type: {value['Type']}")