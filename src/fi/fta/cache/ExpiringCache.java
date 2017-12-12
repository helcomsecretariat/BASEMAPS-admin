package fi.fta.cache;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.CountDownLatch;

public class ExpiringCache<K, V>
{
	
	protected long expireTime;
	
	protected Boolean cacheLock;
	
	protected HashMap<K, Long> expireTimes;
	
	protected HashMap<K, V> cache;
	
	public ExpiringCache(long expireTime)
	{
		this.expireTime = expireTime;
		this.cacheLock = Boolean.valueOf(true);
		this.expireTimes = new HashMap<K, Long>();
		this.cache = new HashMap<K, V>();
	}
	
	public long getExpireTime()
	{
		return expireTime;
	}
	
	private void check(K id)
	{
		Long check = expireTimes.get(id);
		if (check != null && check < System.currentTimeMillis())
		{
			cache.remove(id);
			expireTimes.remove(id);
		}
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
			long et = System.currentTimeMillis() + expireTime;
			for (Entry<K, V> e : beans.entrySet())
			{
				cache.put(e.getKey(), e.getValue());
				expireTimes.put(e.getKey(), et);
			}
			if (start)
			{
				startCleaner();
			}
		}
	}

	public boolean contains(K id)
	{
		synchronized (cacheLock)
		{
			this.check(id);
			return cache.containsKey(id);
		}
	}
	
	public V get(K id)
	{ 
		synchronized (cacheLock)
		{
			this.check(id);
			return cache.get(id);
		}
	}
	
	public boolean containsAll(Collection<K> ids)
	{
		synchronized (cacheLock)
		{
			for (K id : ids)
			{
				this.check(id);
				if (!cache.containsKey(id))
				{
					return false;
				}
			}
			return true;
		}
	}
	
	public V remove(K id)
	{
		synchronized (cacheLock)
		{	
			expireTimes.remove(id);
			V ret = cache.remove(id);
			if (ret != null && cache.isEmpty())
			{
				this.stopCleaner();
			}
			return ret;
		}
	}
	
	public Collection<V> removeAll(Collection<K> ids)
	{
		synchronized (cacheLock)
		{
			List<V> ret = new ArrayList<V>(ids.size());
			for (K id : ids)
			{
				expireTimes.remove(id);
				V bean = cache.remove(id);
				if (bean != null)
				{
					ret.add(bean);
				}
			}
			if (cache.isEmpty())
			{
				this.stopCleaner();
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
		
		protected volatile boolean running;
		
		protected Thread thread;
		
		public Cleaner()
		{
			this.running = true;
			this.thread = new Thread(this);
			this.thread.start();
		}
		
		public void run()
		{
			try
			{
				Thread.sleep(expireTime);
				
				while (running)
				{
					synchronized (cacheLock)
					{
						long current = System.currentTimeMillis();
						for (Iterator<Entry<K, Long>> it = expireTimes.entrySet().iterator(); it.hasNext();)
						{
							Entry<K, Long> e = it.next();
							if (e.getValue() < current)
							{
								cache.remove(e.getKey());
								it.remove();
							}
						}
						if (cache.isEmpty())
						{
							running = false;
							cleaner = null;
							ExpiringCache.this.countDown();
							return;
						}
					}
					
					Thread.sleep(expireTime);
				}
			}
			catch (InterruptedException ex)
			{
				if (running)
				{
					ex.printStackTrace();
				}
			}
			cleaner = null;
			ExpiringCache.this.countDown();
		}
		
		public void stop()
		{
			running = false;
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
		}
	}
	
}
