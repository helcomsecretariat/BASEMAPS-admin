#!/bin/sh

. /etc/profile
if [ -f $HOME/.bash_profile ]; then
	. $HOME/.bash_profile
else
	. $HOME/.profile
fi

CLASSPATH=classes

for lib in `ls -d lib/*`
do
    CLASSPATH=$CLASSPATH:$lib
done

for lib in `ls -d $CATALINA_HOME/lib/*`
do
    CLASSPATH=$CLASSPATH:$lib
done

export CLASSPATH
