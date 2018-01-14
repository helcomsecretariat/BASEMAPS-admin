package fi.fta.utils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import fi.fta.beans.Pair;
import fi.fta.beans.UrlFacade;


public class CollectionsUtils
{
	
	public static <T1, T2, P extends Pair<T1, T2>> List<T1> listFirst(Collection<P> pairs)
	{
		ArrayList<T1> ret = new ArrayList<T1>();
		for (Pair<T1, T2> p : pairs)
			ret.add(p.getFirst());
		return ret;
	}
	
	public static <T extends UrlFacade> Set<T> removeAllByUrl(Set<T> main, Set<T> side)
	{
		Set<T> ret = new HashSet<>(main);
		ret.removeAll(side);
		return ret;
	}
	
	public static <T extends UrlFacade> Set<T> retainAllByUrl(Set<T> main, Set<T> side)
	{
		Set<T> ret = new HashSet<>(main);
		ret.retainAll(side);
		return ret;
	}

}
