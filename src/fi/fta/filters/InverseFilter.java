package fi.fta.filters;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class InverseFilter<T> implements ObjectFilter<T>
{
	
	protected ObjectFilter<T> filter;
	
	public InverseFilter(ObjectFilter<T> filter)
	{
		this.filter = filter;
	}

	public boolean match(T obj)
	{
		return !filter.match(obj);
	}
	
	public <TE extends T> Set<TE> filter(Collection<TE> objects)
	{
		HashSet<TE> ret = new HashSet<TE>(objects);
		ret.removeAll(filter.filter(ret));
		return ret;
	}
	
	public <TE extends T> List<TE> filter(List<TE> objects)
	{
		List<TE> ret = new ArrayList<>(objects);
		List<TE> filtered = filter.filter(ret);
		ret.removeAll(filtered);
		return ret;
	}
	
}
