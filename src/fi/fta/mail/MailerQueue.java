package fi.fta.mail;

import java.util.LinkedList;
import java.util.SortedMap;
import java.util.TreeMap;


public class MailerQueue
{
	
	protected static final int CAPACITY_MIN = 10;
	protected static final int CAPACITY_MAX = 100;
	
	protected static final int EMPTY_COUNT_LIMIT = 6;
	protected static final long WAIT_ON_EMPTY_TIME = 10 * 1000L;
	
	protected Boolean messagesLock;
	
	protected SortedMap<Short, LinkedList<MailMessage>> messages;
	
	protected volatile int queued;
	
	protected volatile int capacity;
	
	protected volatile int emptyCount;
	
	protected volatile boolean finished;
	
	
	public MailerQueue(int capacity)
	{
		this.messagesLock = new Boolean(true);
		this.messages = new TreeMap<Short, LinkedList<MailMessage>>();
		this.queued = 0;
		this.capacity = capacity;
		this.emptyCount = 0;
		this.finished = false;
	}
	
	public MailerQueue()
	{
		this(MailerQueue.CAPACITY_MAX);
	}
	
	public synchronized void put(Short priority, MailMessage mm)
	{
		while (this.capacity <= this.queued)
		{
			try
			{
				this.wait();
			}
			catch (InterruptedException ex)
			{
				System.out.println("Interrupted putting!");
			}
		}
		
		synchronized (messagesLock)
		{
			LinkedList<MailMessage> list = messages.get(priority);
			if (list == null)
			{
				list = new LinkedList<MailMessage>();
				messages.put(priority, list);
			}
			list.addLast(mm);
			this.queued++;
		}
		System.out.println("Queued " + mm.getTo().getAddress() + " [" + this.queued + "]" );
		
		this.notifyAll();
	}
	
	public synchronized MailMessage take()
	{
		MailMessage ret = null;
		boolean empty = true;
		while (empty && this.emptyCount < MailerQueue.EMPTY_COUNT_LIMIT)
		{
			synchronized (messagesLock)
			{
				empty = messages.isEmpty();
				if (!empty)
				{
					Short key = messages.firstKey();
					LinkedList<MailMessage> m = messages.get(key);
					ret = m.removeFirst();
					if (m.isEmpty())
						messages.remove(key);
					this.queued--;
					this.emptyCount = 0;
				}
				else if (this.finished)
					return null;
				else
					this.emptyCount++;
			}
			
			if (empty && this.emptyCount < MailerQueue.EMPTY_COUNT_LIMIT)
			{
				try
				{
					this.wait(MailerQueue.WAIT_ON_EMPTY_TIME);
				}
				catch (InterruptedException ex)
				{
					System.out.println("Interrupted taking!");
				}
			}
		}
		this.notifyAll();
		return ret;
	}
	
	public synchronized void end()
	{
		this.finished = true;
	}
	
	@Override
	protected void finalize() throws Throwable
	{
		System.out.println("GC: " + this);
		super.finalize();
	}
	
	
	public static MailerQueue createRuntimeDependingQueue()
	{
		float f = ((float)Runtime.getRuntime().freeMemory())/(float)Runtime.getRuntime().maxMemory();
		if (f >= 0.9f)
			return new MailerQueue(MailerQueue.CAPACITY_MIN);
		else
			return new MailerQueue();
	}
	
}
