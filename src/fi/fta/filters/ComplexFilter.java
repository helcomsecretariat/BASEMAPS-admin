package fi.fta.filters;

import java.util.Collection;
import java.util.HashSet;

public abstract class ComplexFilter<T> extends GenericFilter<T>
{
	
	protected HashSet<ObjectFilter<T>> filters = new HashSet<ObjectFilter<T>>();
	
	public ComplexFilter()
	{}
	
	public ComplexFilter(Collection<? extends ObjectFilter<T>> filters)
	{
		this.filters.addAll(filters);
	}

	public HashSet<ObjectFilter<T>> getFilters()
	{
		return filters;
	}

	public void setFilters(Collection<? extends ObjectFilter<T>> filters)
	{
		this.filters = new HashSet<ObjectFilter<T>>(filters);
	}
	
	public boolean addFilter(ObjectFilter<T> filter)
	{
		return filters.add(filter);
	}
	
	public boolean removeFilter(ObjectFilter<T> filter)
	{
		return filters.remove(filter);
	}
	
}
