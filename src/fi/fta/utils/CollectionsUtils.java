package fi.fta.utils;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import fi.fta.beans.Pair;
import fi.fta.beans.UrlFacade;


public class CollectionsUtils
{
	
	public static <T1, T2, P extends Pair<T1, T2>> List<T1> listFirst(Collection<P> pairs)
	{
		ArrayList<T1> ret = new ArrayList<T1>();
		for (Pair<T1, T2> p : pairs)
		{
			ret.add(p.getFirst());
		}
		return ret;
	}
	
	public static <T extends UrlFacade> Set<T> removeAllByUrl(Collection<T> main, Collection<T> side)
	{
		Map<String, T> ret = new HashMap<>();
		for (T url : main)
		{
			ret.put(url.getUrl(), url);
		}
		for (T url : side)
		{
			ret.remove(url.getUrl());
		}
		return new HashSet<>(ret.values());
	}
	
	public static <T extends UrlFacade> Set<T> retainAllByUrl(Collection<T> main, Collection<T> side)
	{
		Map<String, T> m1 = new HashMap<>();
		for (T url : side)
		{
			m1.put(url.getUrl(), url);
		}
		Map<String, T> ret = new HashMap<>();
		for (T url : main)
		{
			if (m1.containsKey(url.getUrl()))
			{
				ret.put(url.getUrl(), url);
			}
		}
		return new HashSet<>(ret.values());
	}
	
	public static <T extends UrlFacade> T getByUrl(String url, Collection<T> main)
	{
		for (T u : main)
		{
			if (Util.equalsWithNull(url, u.getUrl()))
			{
				return u;
			}
		}
		return null;
	}
	
}
