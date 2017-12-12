
package fi.fta.utils.profile;

import java.text.NumberFormat;
import java.util.HashMap;
import java.util.Map.Entry;


public class Profiler
{
	
	private HashMap<String, Long> times;
    
    public Profiler()
    {
    	times = new HashMap<String, Long>();
    }
    
    public synchronized void startCheck(String name)
    {
    	times.put(name + "_", System.currentTimeMillis());
    	ProfilerStatistics.addIncompleteTask(name);
    }
    
    public synchronized void cancelCheck(String name)
    {
    	times.remove(name + "_");
    	ProfilerStatistics.cancelTask(name);
    }
    
    public synchronized void stopCheck(String name)
    {
    	Long start = times.remove(name + "_");
    	if (start == null)
    		return;
    	
    	long time = System.currentTimeMillis() - start;
    	times.put(name, time);
    	ProfilerStatistics.completeTask(name, time);
    }
    
    public synchronized Long getTime(String name)
    {
    	return times.get(name);
    }
    
    public synchronized String getTimeStr(String name)
    {
    	Long time = times.get(name);
    	if (time == null)
    		return null;
    	return Profiler.getHumanLookingSize((double)(time.doubleValue() / 1000), "s");
    }
    
    public synchronized void print()
    {
    	System.out.println("Profiler info:");
    	for (Entry<String, Long> e : times.entrySet())
    		if (!e.getKey().endsWith("_"))
    			System.out.println(e.getKey() + ": " + getTimeStr(e.getKey()));
    }
    
    
	public static String getHumanLookingSize(double size, String measure)
	{
		  NumberFormat nf = NumberFormat.getInstance();
		  nf.setMaximumFractionDigits(2);
		  if (size >= 1125899906842624.)
			  return nf.format(size / 1125899906842624.) + "P" + measure;
		  else if (size >= 1099511627776.)
			  return nf.format(size / 1099511627776.) + "T" +measure;
		  else if (size >= 1073741824)
			  return nf.format(size / 1073741824) + "G" + measure;
		  else if (size >= 1048576)
			  return nf.format(size / 1048576) + "M" + measure;
		  else if (size >= 1024)
		  	  return nf.format(size / 1024) + "K" + measure;
		  else if (size >= 0)
		  	  return "" + size + measure;
		  else if (size >= 0.0009765625)
			  return nf.format(size * 1024) + "m" + measure;
		  else if (size >= 9.5367431640625e-07)
			  return nf.format(size * 1048576) + "u" + measure;
		  else if (size >= 9.313225746154785156e-10)
			  return nf.format(size * 1073741824) + "p" + measure;
		  else// if (size >= 9.094947017729282379e-13)
			  return nf.format(size * 1099511627776.) + "n" + measure;
		  
	}
	
	public synchronized void reset() 
	{
		times.clear();
	}
	
	@Override
	protected void finalize() throws Throwable
	{
		times.clear();
		super.finalize();
	}
	
}
