package fi.fta.filters;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;


public class ConjunctiveFilter<T> extends ComplexFilter<T>
{
	
	public ConjunctiveFilter()
	{
		super();
	}

	public ConjunctiveFilter(Collection<? extends ObjectFilter<T>> filters)
	{
		super(filters);
	}

	public boolean match(T obj)
	{
		for (ObjectFilter<T> f : filters)
			if (!f.match(obj))
				return false;
		
		return true;
	}
	
	@Override
	public <TE extends T> Set<TE> filter(Collection<TE> objects)
	{
		Set<TE> ret = new HashSet<TE>(objects);
		for (ObjectFilter<T> f : filters)
			ret = f.filter(ret);
		return ret;
	}
	
}
