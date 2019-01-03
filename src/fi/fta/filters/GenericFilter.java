package fi.fta.filters;

import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.Vector;
import java.util.function.Function;

public abstract class GenericFilter<T> implements ObjectFilter<T>
{
	
	public <TE extends T> Set<TE> filter(Collection<TE> objects)
	{
		HashSet<TE> ret= new HashSet<TE>(objects.size());
		for (TE o : objects)
			if (!ret.contains(o) && match(o))
				ret.add(o);
		return ret;
	}
	
	public <TE extends T> List<TE> filter(List<TE> objects)
	{
		Vector<TE> ret= new Vector<TE>(objects.size());
		HashSet<TE> ret2 = new HashSet<TE>(objects.size());
		for (TE o : objects)
			if (ret2.contains(o))
				ret.add(o);
			else if (match(o))
			{
				ret.add(o);
				ret2.add(o);
			}	
		return ret;
	}
	
	
	public static <T> GenericFilter<T> create(Function<T, Boolean> match)
	{
		return new GenericFilter<T>()
		{
			@Override
			public boolean match(T obj)
			{
				return match.apply(obj).booleanValue();
			}
		};
	}
	
}
