package fi.fta.cache;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.CountDownLatch;

public class TimeBasedCache<K, V>
{
	
	protected long expireTime;
	
	protected Boolean cacheLock;
	
	protected HashMap<K, Long> expireTimes;
	
	protected HashMap<K, V> cache;
	
	public TimeBasedCache(long expireTime)
	{
		this.cacheLock = Boolean.valueOf(true);
		this.expireTimes = new HashMap<K, Long>();
		this.cache = new HashMap<K, V>();
		this.expireTime = expireTime;
	}
	
	public long getExpireTime()
	{
		return expireTime;
	}
	
	public void put(K key, V value)
	{ 
		synchronized (cacheLock)
		{
			boolean start = cache.isEmpty();
			
			cache.put(key, value);
			expireTimes.put(key, System.currentTimeMillis() + expireTime);
			
			if (start)
			{
				this.startCleaner();
			}
		}
	}
	
	public void putAll(Map<K, V> beans)
	{
		synchronized (cacheLock)
		{
			boolean start = cache.isEmpty();
			
			long eTime = System.currentTimeMillis() + expireTime;
			
			for (Entry<K, V> e : beans.entrySet())
			{
				cache.put(e.getKey(), e.getValue());
				expireTimes.put(e.getKey(), eTime);
			}
			
			if (start)
			{
				this.startCleaner();
			}
		}
	}
	
	public V get(K id)
	{ 
		synchronized (cacheLock)
		{
			V ret = cache.get(id);
			
			if (ret == null)
				return null;
			
			expireTimes.put(id, System.currentTimeMillis() + expireTime);
			
			return ret;
		}
	}
	
	public V getElementWithoutExtendingExpireTime(K id)
	{
		synchronized (cacheLock)
		{
			return cache.get(id);
		}
	}
	
	@SuppressWarnings("unchecked")
	public Map<K, V> getCopyAll()
	{
		synchronized (cacheLock)
		{
			return (Map<K, V>)cache.clone();
		}
	}
	
	public Collection<V> getElementsWithoutExtendingExpireTime()
	{
		synchronized (cacheLock)
		{
			return cache.values();
		}
	}
	
	public boolean contains(K id)
	{
		synchronized (cacheLock)
		{
			return cache.containsKey(id);
		}
	}
	
	public boolean containsAll(Collection<K> ids)
	{
		synchronized (cacheLock)
		{
			for (K id : ids)
				if (!cache.containsKey(id))
					return false;
			
			return true;
		}
	}
	
	public V remove(K id)
	{
		synchronized (cacheLock)
		{	
			V ret = cache.remove(id);
			
			if (ret == null)
				return null;
	
			if (cache.isEmpty())
			{
				this.stopCleaner();
				
				expireTimes.clear();
			}
			
			return ret;
		}
	}
	
	public Collection<V> removeAll(Collection<K> ids)
	{
		synchronized (cacheLock)
		{
			ArrayList<V> ret = new ArrayList<V>(ids.size());
			
			for (K id : ids)
			{
				V bean = cache.remove(id);
				
				if (bean == null)
					continue;
				
				ret.add(bean);
			}
			
			if (cache.isEmpty())
			{
				this.stopCleaner();
				expireTimes.clear();
			}
			
			return ret;
		}
	}
	
	public boolean isEmpty()
	{
		synchronized (cacheLock)
		{
			return cache.isEmpty();
		}
	}
	
	public void clear()
	{
		synchronized (cacheLock)
		{
			cache.clear();
			this.stopCleaner();
		}
	}
	
	private CountDownLatch latch;
	
	public void countDown()
	{
		if (latch != null)
		{
			latch.countDown();
		}
	}
	
	private volatile Cleaner cleaner;
	
	protected class Cleaner implements Runnable
	{
		
		protected boolean stop;
		
		protected Thread thread;
		
		public Cleaner()
		{
			thread = new Thread(this);
			thread.start();
		}
		
		public void run()
		{
			try
			{
				Thread.sleep(expireTime);
				
				while (!stop)
				{
					synchronized (cacheLock)
					{
						long currentTime = System.currentTimeMillis();
						
						for (Iterator<Entry<K, Long>> it = expireTimes.entrySet().iterator(); it.hasNext(); )
						{
							Entry<K, Long> e = it.next();
							
							if (e.getValue() > currentTime)
								continue;
							
							cache.remove(e.getKey());
							it.remove();
						}
						if (cache.isEmpty())
						{
							stop = true;
							cleaner = null;
							TimeBasedCache.this.countDown();
							return;
						}
					}
					
					Thread.sleep(expireTime);
				}
			}
			catch (InterruptedException ex)
			{
				if (!stop)
				{
					ex.printStackTrace();
				}
			}
			cleaner = null;
			TimeBasedCache.this.countDown();
		}
		
		public void stop()
		{
			stop = true;
			thread.interrupt();
		}
		
	}

	protected void startCleaner()
	{
		cleaner = new Cleaner();
	}
	
	protected void stopCleaner()
	{
		if (cleaner != null)
		{
			latch = new CountDownLatch(1);
			cleaner.stop();
			while (cleaner != null)
			{
				System.out.print("Clearing " + cleaner);
				try
				{
					if (cleaner != null)
					{
						latch.await();
					}
				}
				catch (InterruptedException ex)
				{
					ex.printStackTrace();
				}
				if (cleaner == null)
				{
					System.out.println(".. done");
				}
			}
			latch = null;
		}
	}
	
}
