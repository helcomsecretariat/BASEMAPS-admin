package fi.fta.filters;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;

public class AdjunctiveFilter<T> extends ComplexFilter<T>
{
	
	public AdjunctiveFilter()
	{
		super();
	}
	
	public AdjunctiveFilter(Collection<? extends ObjectFilter<T>> filters)
	{
		super(filters);
	}
	
	public boolean match(T obj)
	{
		for (ObjectFilter<T> f : filters)
			if (f.match(obj))
				return true;
		
		return false;
	}
	
	@Override
	public <TE extends T> Set<TE> filter(Collection<TE> objects)
	{
		Set<TE> ret = new HashSet<TE>(objects);
		for (ObjectFilter<T> f : filters)
			ret.addAll(f.filter(objects));
		return ret;
	}
	
}
