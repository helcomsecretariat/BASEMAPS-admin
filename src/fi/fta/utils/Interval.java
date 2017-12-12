package fi.fta.utils;

import java.io.Serializable;
import java.util.Comparator;

public class Interval<T extends Comparable<T>> implements Serializable
{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = -3608386180284249644L;
	
	protected T lowerRange;
	protected T higherRange;
	protected boolean lowerRangeInclusive;
	protected boolean higherRangeInclusive;
	
	public Interval()
	{
		lowerRange = null;
		lowerRangeInclusive = false;
		higherRange = null;
		higherRangeInclusive = false;
	}
	
	public Interval(T lr, boolean lrinclusive, T hr, boolean hrinclusive)
	{
		if (lr == null || hr == null || lr.compareTo(hr) <= 0)
		{
			lowerRange = lr;
			lowerRangeInclusive = lr == null ? false : lrinclusive;
			higherRange = hr;
			higherRangeInclusive = hr == null ? false : hrinclusive;
		}
		else
		{
			lowerRange = hr;
			lowerRangeInclusive = hr == null ? false : hrinclusive;
			higherRange = lr;
			higherRangeInclusive = lr == null ? false : lrinclusive;
		}
	}
	
	public Interval(T lr, T hr)
	{
		this(lr, true, hr, false);
	}
	
	public Interval(T lr, boolean lrinclusive)
	{
		this(lr, lrinclusive, null, false);
	}
	
	public Interval(T lr)
	{
		this(lr, true);
	}
	
	public Interval(Interval<T> i)
	{
		this(i.getLowerRange(), i.isLowerRangeInclusive(), i.getHigherRange(), i.isHigherRangeInclusive());
	}
	
	public boolean contains(T obj)
	{
		if (obj == null)
			return false;
		
		int l = lowerRange == null ? -1 : lowerRange.compareTo(obj);
		int h = higherRange == null ? 1 : higherRange.compareTo(obj);
		
		if (l > 0 || (!lowerRangeInclusive && l == 0))
			return false;
		if (h < 0 || (!higherRangeInclusive && h == 0))
			return false;
		
		return true;
	}
	
	public boolean concat(Interval<T> i)
	{
		if (i == null)
			return false;
		
		/* Baigtinis intervalas i */
		if (i.isFinite())
		{
			boolean containsLower = this.contains(i.getLowerRange());
			boolean containsHigher = this.contains(i.getHigherRange());
			if (containsLower && containsHigher)
				return true;
			else if (containsLower || 
				higherRange != null && higherRange.equals(i.getLowerRange()) && i.isLowerRangeInclusive())
			{
				this.setHigher(i);
				return true;
			}
			else if (containsHigher || 
				lowerRange != null && lowerRange.equals(i.getHigherRange()) && i.isHigherRangeInclusive())
			{
				this.setLower(i);
				return true;
			}
			else
			{
				if (lowerRange != null && i.contains(lowerRange) || higherRange != null && i.contains(higherRange))
				{
					this.setAll(i);
					return true;
				}
				return false;
			}
		}
		/* Nebaigtinis intervalas i */
		else
		{
			/* Nebaigtinis intervalas is abieju pusiu */
			if (i.getLowerRange() == null && i.getHigherRange() == null)
			{
				if (lowerRange != null || higherRange != null)
					this.setAll(i);
				return true;
			}
			/* Nebaigtinis intervalas i is kaires */
			else if (i.getLowerRange() == null)
			{
				if (!this.contains(i.getHigherRange()))
				{
					if (higherRange != null && i.contains(higherRange))
						this.setHigher(i);
					else
						return false;
				}
				if (lowerRange != null)
					this.setLower(i);
				return true;
			}
			/* Nebaigtinis intervalas i is desines */
			else //if (i.getHigherRange() == null)
			{
				if (!this.contains(i.getLowerRange()))
				{
					if (lowerRange != null && i.contains(lowerRange))
						this.setLower(i);
					else
						return false;
				}
				if (higherRange != null)
					this.setHigher(i);
				return true;
			}
		}
	}

	public T getLowerRange() {
		return lowerRange;
	}

	public void setLowerRange(T lowerRange) {
		this.lowerRange = lowerRange;
	}

	public T getHigherRange() {
		return higherRange;
	}

	public void setHigherRange(T higherRange) {
		this.higherRange = higherRange;
	}

	public boolean isLowerRangeInclusive() {
		return lowerRangeInclusive;
	}

	public void setLowerRangeInclusive(boolean lowerRangeInclusive) {
		this.lowerRangeInclusive = lowerRangeInclusive;
	}

	public boolean isHigherRangeInclusive() {
		return higherRangeInclusive;
	}

	public void setHigherRangeInclusive(boolean higherRangeInclusive) {
		this.higherRangeInclusive = higherRangeInclusive;
	}
	
	@Override
	public boolean equals(Object o)
	{
		if (!(o instanceof Interval))
			return false;
		try
		{
			Interval<?> i = (Interval<?>)o;
			
			if ((lowerRange != null && !lowerRange.equals(i.getLowerRange())) || lowerRange == null && i.getLowerRange() != null)
				return false;
			if ((higherRange != null && !higherRange.equals(i.getHigherRange())) || higherRange == null && i.getHigherRange() != null)
				return false;
			if (lowerRangeInclusive != i.isLowerRangeInclusive())
				return false;
			if (higherRangeInclusive != i.isHigherRangeInclusive())
				return false;
			return true;
		}
		catch (ClassCastException ex)
		{
			return false;
		}
	}
	
	public String print()
	{
		StringBuffer ret = new StringBuffer();
		ret.append(this.isLowerRangeInclusive() ? "[" : "(");
		ret.append(lowerRange == null ? "-infinity" : lowerRange.toString());
		ret.append(", ");
		ret.append(higherRange == null ? "infinity" : higherRange.toString());
		ret.append(this.isHigherRangeInclusive() ? "]" : ")");
		return ret.toString();
	}
	
	public String printLower()
	{
		if (lowerRange != null)
			return lowerRange.toString();
		else
			if (higherRange != null)
				return " < " + higherRange.toString();
			else
				return "-infinity";
	}
	
	public String printHigher()
	{
		if (higherRange != null)
			return higherRange.toString();
		else
			if (lowerRange != null)
				return lowerRange.toString() + " > ";
			else
				return "infinity";
	}
	
	protected void setAll(Interval<T> i)
	{
		this.setLower(i);
		this.setHigher(i);
	}
	
	protected void setLower(Interval<T> i)
	{
		lowerRange = i.getLowerRange();
		lowerRangeInclusive = i.isLowerRangeInclusive();
	}
	
	protected void setHigher(Interval<T> i)
	{
		higherRange = i.getHigherRange();
		higherRangeInclusive = i.isHigherRangeInclusive();
	}
	
	public int compareLower(Interval<T> i)
	{
		if (lowerRange != null && i.getLowerRange() != null)
			return this.compareLowerNotNull(i);
		else if (lowerRange != null)
			return 1;
		else if (i.getLowerRange() != null)
			return -1;
		else
			return 0;
	}
	
	public int compareHigher(Interval<T> i)
	{
		if (higherRange != null && i.getHigherRange() != null)
			return this.compareHigherNotNull(i);
		else if (higherRange != null)
			return -1;
		else if (i.getHigherRange() != null)
			return 1;
		else
			return 0;
			
	}
	
	protected int compareLowerNotNull(Interval<T> i)
	{
		int c = lowerRange.compareTo(i.getLowerRange());
		if (c != 0)
			return c;
		else
		{
			if (lowerRangeInclusive == i.isLowerRangeInclusive())
				return 0;
			else if (lowerRangeInclusive)
				return -1;
			else
				return 1;
		}
	}
	
	protected int compareHigherNotNull(Interval<T> i)
	{
		int c = higherRange.compareTo(i.getHigherRange());
		if (c != 0)
			return c;
		else
		{
			if (higherRangeInclusive == i.isHigherRangeInclusive())
				return 0;
			else if (higherRangeInclusive)
				return 1;
			else
				return -1;
		}
	}
	
	public boolean isFinite()
	{
		return this.getLowerRange() != null && this.getHigherRange() != null;
	}
	
	public static <V extends Comparable<V>> Comparator<Interval<V>> lowerRangeComparator(Class<V> cls)
	{
		return new Comparator<Interval<V>>()
			{
				public int compare(Interval<V> i1, Interval<V> i2)
				{
					int c = i1.compareLower(i2);
					if (c != 0)
						return c;
					else if (!i1.equals(i2))
						return i1.compareHigher(i2);
					else
						return 0;
				}
			};
	}
	
	public static <V extends Comparable<V>> Comparator<Interval<V>> higherRangeComparator(Class<V> cls)
	{
		return new Comparator<Interval<V>>()
			{
				public int compare(Interval<V> i1, Interval<V> i2)
				{
					int c = i1.compareHigher(i2);
					if (c != 0)
						return c;
					else if (!i1.equals(i2))
						return i1.compareLower(i2);
					else
						return 0;
				}
			};
	}
	
}
