package fi.fta.cache;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.concurrent.CountDownLatch;
import java.util.function.Consumer;

public class TimeBasedCache<K, V>
{
	
	protected long expireTime;
	
	protected Boolean cacheLock;
	
	protected Map<K, Long> expireTimes;
	
	protected HashMap<K, V> cache;
	
	protected Consumer<List<V>> afterRemove;
	
	
	public TimeBasedCache(long expireTime)
	{
		this(expireTime, (values)->{});
	}
	
	public TimeBasedCache(long expireTime, Consumer<List<V>> afterRemove)
	{
		this.cacheLock = Boolean.valueOf(true);
		this.expireTimes = new HashMap<>();
		this.cache = new HashMap<>();
		this.expireTime = expireTime;
		this.afterRemove = afterRemove;
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
			if (ret != null)
			{
				expireTimes.put(id, System.currentTimeMillis() + expireTime);
			}
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
			{
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
			V ret = cache.remove(id);
			if (ret != null && cache.isEmpty())
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
			List<V> ret = new ArrayList<>(ids.size());
			for (K id : ids)
			{
				V bean = cache.remove(id);
				if (bean != null)
				{
					ret.add(bean);
				}
			}
			if (cache.isEmpty())
			{
				this.stopCleaner();
				expireTimes.clear();
			}
			return ret;
		}
	}
	
	public Collection<V> removeAll()
	{
		synchronized (cacheLock)
		{
			List<V> ret = new ArrayList<>(cache.values());
			if (!cache.isEmpty())
			{
				cache.clear();
				this.stopCleaner();
				expireTimes.clear();
			}
			return ret;
		}
	}
	
	public int size()
	{
		synchronized (cacheLock)
		{
			return cache.size();
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
			expireTimes.clear();
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
					List<V> removed = new ArrayList<>();
					synchronized (cacheLock)
					{
						long currentTime = System.currentTimeMillis();
						for (Iterator<Entry<K, Long>> it = expireTimes.entrySet().iterator(); it.hasNext(); )
						{
							Entry<K, Long> e = it.next();
							if (e.getValue() <= currentTime)
							{
								V v = cache.remove(e.getKey());
								it.remove();
								if (v != null)
								{
									removed.add(v);
								}
							}
						}
						if (cache.isEmpty())
						{
							stop = true;
							cleaner = null;
							TimeBasedCache.this.countDown();
							return;
						}
					}
					TimeBasedCache.this.afterRemove.accept(removed);
					
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
