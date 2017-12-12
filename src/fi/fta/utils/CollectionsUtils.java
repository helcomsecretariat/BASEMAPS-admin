package fi.fta.utils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import fi.fta.beans.Pair;


public class CollectionsUtils
{
	
	public static <T1, T2, P extends Pair<T1, T2>> List<T1> listFirst(Collection<P> pairs)
	{
		ArrayList<T1> ret = new ArrayList<T1>();
		for (Pair<T1, T2> p : pairs)
			ret.add(p.getFirst());
		return ret;
	}
	
}
