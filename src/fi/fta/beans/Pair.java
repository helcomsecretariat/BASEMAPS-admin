package fi.fta.beans;

import java.io.Serializable;

import fi.fta.utils.Util;

public class Pair<T1, T2> implements Serializable
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 5693567879135963700L;

	protected T1 first;
	
	protected T2 second;
	
	public Pair()
	{}
	
	public Pair(T1 first, T2 second)
	{
		this.first = first;
		this.second = second;
	}
	
	public T1 getFirst() {
		return first;
	}

	public void setFirst(T1 first) {
		this.first = first;
	}

	public T2 getSecond() {
		return second;
	}

	public void setSecond(T2 second) {
		this.second = second;
	}

	public void set(Pair<T1, T2> p)
	{
		this.setFirst(p.getFirst());
		this.setSecond(p.getSecond());
	}
	
	@Override
    public int hashCode()
    {
		return 3 + 
			(this.getFirst() != null ? this.getFirst().hashCode() : -1) +
			(this.getSecond() != null ? 7 * this.getSecond().hashCode() : -1);
    }
	
	@Override
    public boolean equals(Object o)
    {
    	if (o == null || !(o instanceof Pair))
    		return false;
    	Pair<?, ?> p = (Pair<?, ?>)o;
    	return
    		Util.equalsWithNull(this.getFirst(), p.getFirst()) && 
    		Util.equalsWithNull(this.getSecond(), p.getSecond());
    }
	
	@Override
	public String toString()
	{
		return "Pair:[" + this.getFirst() + ", " + this.getSecond() + "]" + "@" + this.hashCode();
	}
	
}
