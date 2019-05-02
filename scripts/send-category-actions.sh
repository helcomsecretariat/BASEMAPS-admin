#!/bin/sh

cd `dirname $0`

. ./init.sh

echo CategoryBeanActionManager `date +"%Y %m %d %H:%M"`

java fi.fta.data.managers.CategoryBeanActionManager

echo CategoryBeanActionManager END `date +"%Y %m %d %H:%M"`
