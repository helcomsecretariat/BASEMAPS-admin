#!/bin/sh

cd `dirname $0`

. ./init.sh

echo DbMaintenanceManager `date +"%Y %m %d %H:%M"`

java fi.fta.data.managers.DbMaintenanceManager

echo DbMaintenanceManager END `date +"%Y %m %d %H:%M"`
