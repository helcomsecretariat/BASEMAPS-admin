package fi.fta.utils.profile;

import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

public class ProfilerStatistics
{
	
	public static Map<String, List<Long>> timeMap = new HashMap<String, List<Long>>();
	public static Map<String, Integer> incompleteTasks = new HashMap<String, Integer>();
	
	protected ProfilerStatistics()
	{}
	
	public static void addIncompleteTask(String name)
	{
		synchronized (incompleteTasks)
		{
			Integer count = incompleteTasks.get(name);
			incompleteTasks.put(name, count == null ? 1 : count + 1);
		}
	}
	
	public static void cancelTask(String name)
	{
		synchronized (incompleteTasks)
		{
			incompleteTasks.remove(name);
		}
	}
	
	public static void completeTask(String name, Long time)
	{
		synchronized (incompleteTasks)
		{
			Integer count = incompleteTasks.get(name);
			if (count != null) {
				if (count.intValue() > 1)
					incompleteTasks.put(name, count - 1);
				else
					incompleteTasks.remove(name);
			}
		}
		ProfilerStatistics.addTime(name, time);
	}
	
	public static Map<String, Integer> getIncompleteTasks()
	{
		synchronized (incompleteTasks)
		{
			return new HashMap<String, Integer>(incompleteTasks);
		}
	}
	
	
	public static void addTime(String name, Long time)
	{
		synchronized (timeMap)
		{
			List<Long> times = timeMap.get(name);
			if (times == null)
			{
				times = new LinkedList<Long>();
				timeMap.put(name, times);
			}
			times.add(time);
		}
	}
	
	public static Map<String, List<Long>> getTimeMap()
	{
		synchronized (timeMap)
		{
			return new HashMap<String, List<Long>>(timeMap);
		}
	}
	
	public static List<Long> getTimes(String name)
	{
		synchronized (timeMap)
		{
			return timeMap.get(name);
		}
	}
	
	public static Long getAverage(String name)
	{
		synchronized (timeMap)
		{
			List<Long> times = timeMap.get(name);
			double avg = .0;
			for (Long t : times)
				avg += t;
			avg /= times.size();
			return (long)avg;
		}
	}
	
	public static Map<String, Long> getAverages()
	{
		synchronized (timeMap)
		{
			HashMap<String, Long> ret = new HashMap<String, Long>(timeMap.size());
			for (String name : timeMap.keySet())
				ret.put(name, ProfilerStatistics.getAverage(name));
			return ret;
		}
	}
	
	public static Map<String, StatisticsEntry> getStatistics()
	{
		synchronized (timeMap)
		{
			HashMap<String, StatisticsEntry> ret = new HashMap<String, StatisticsEntry>(timeMap.size());
			for (Entry<String, List<Long>> e : timeMap.entrySet())
			{
				StatisticsEntry s = new StatisticsEntry();
				s.count = e.getValue().size();
				for (Long t : e.getValue())
					s.sum += t;
				s.average = s.sum / s.count;
				ret.put(e.getKey(), s);
			}
			return ret;
		}
	}
	
	public static class StatisticsEntry
	{
		public long average = 0;
		public long sum = 0;
		public int count = 0;
	}
	
}
