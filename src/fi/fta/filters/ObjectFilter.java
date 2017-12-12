package fi.fta.filters;

import java.util.Collection;
import java.util.List;
import java.util.Set;

public interface ObjectFilter<T>
{
	
	public boolean match(T obj);
	public <TE extends T> Set<TE> filter(Collection<TE> objects);
	public <TE extends T> List<TE> filter(List<TE> objects);
	
}
