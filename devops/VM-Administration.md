# Linux VM Administration — Logos Production

### Machine IP & SSH

Get the machine's internal IP:
```bash
hostname -I
```

SSH into the server:
```bash
ssh tulio-vieira@<server-ip>
```

Install SSH server:
```bash
sudo apt install openssh-server
```

Check open ports:
```bash
netstat -ntlp
```

### Firewall (ufw)

```bash
sudo ufw status
sudo ufw allow 22       # SSH
sudo ufw allow 80       # HTTP
sudo ufw allow 443      # HTTPS
sudo ufw enable
```

Reference: [Ubuntu firewall docs](https://documentation.ubuntu.com/server/how-to/security/firewalls/)

---

### PostgreSQL

Install:
```bash
sudo apt install postgresql
```

Connect as superuser:
```bash
sudo -u postgres psql
\l          # list databases
```

Check service status / config:
```bash
systemctl status postgresql.service
cat /etc/postgresql/16/main/postgresql.conf
```

Allow remote connections — add this line to `/etc/postgresql/*/main/pg_hba.conf`:
```
host  all  postgres  0.0.0.0/0  scram-sha-256
```

Copy a backup file from Windows to the server:
```bash
scp C:\Users\vieir\Documents\learning\postgres-backups tulio-vieira@tulio-vieira-ubuntu:/home/tulio-vieira/Documents/postgresql-backups
```

Restore a `.backup` file (use custom format for pg_dump):
```bash
pg_restore -U postgres -d <database> /path/to/backup.backup
```

---

### Migrations

Generate an idempotent SQL migration script:
```bash
dotnet ef migrations script --idempotent --output migrate.sql
```

Apply the script to the production database:
```bash
psql -U postgres -d logos -f migrate.sql
```

---

### Permissions

Allow anyone to access the deploy directory:
```bash
sudo chmod 755 /var/www/logos
```

---

### Nginx

Test config before applying:
```bash
sudo nginx -t
```

Reload / restart:
```bash
sudo nginx -s reload
sudo systemctl restart nginx
```

Check errors:
```bash
sudo tail -30 /var/log/nginx/error.log
```

Config path:
```
/etc/nginx/sites-enabled/default
```

Set Hangfire dashboard credentials:
```bash
echo "<username>:$(openssl passwd -apr1 '<password>')" | sudo tee /etc/nginx/.htpasswd
```

Reference: [Host .NET on Linux with Nginx](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/linux-nginx?view=aspnetcore-8.0&tabs=linux-ubuntu)

---

### Backend API (logosapi service)

Create the Linux user:
```bash
sudo adduser logosapi
```

Create or edit the systemd service file:
```bash
sudo nano /etc/systemd/system/logosapi.service
```

Enable and manage the service:
```bash
sudo systemctl enable logosapi.service
sudo systemctl daemon-reload    # after editing the .service file
sudo systemctl start logosapi
sudo systemctl stop logosapi
sudo systemctl restart logosapi
```

Follow logs live:
```bash
journalctl -u logosapi.service -f
```

Last 10 log lines:
```bash
journalctl -u logosapi.service -n 10
```

Publish the .NET app:
```bash
dotnet publish -c Release -o /var/www/logos
```

---

TODO: Add a script to populate the prod DB with the initial admin role and user.
