#!/bin/sh
set -e  # Exit script on error

host="$1"
port="$2"
shift 2  # Shift to remove host and port from arguments
cmd="$@"  # Capture remaining arguments as the command

echo "Waiting for $host:$port to be available..."

while ! nc -z "$host" "$port"; do
  sleep 2
done

echo "$host:$port is available, starting backend..."
exec sh -c "$cmd"  # Properly execute the backend command
