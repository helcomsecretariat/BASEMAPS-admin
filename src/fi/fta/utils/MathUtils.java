package fi.fta.utils;

public class MathUtils
{
	
	public MathUtils()
	{}
	
	public static int randomInclusive(int from, int to)
	{
		return MathUtils.random(from, to + 1);
	}
	
	public static int random(int from, int to)
	{
		return from + (int)Math.round(Math.floor(Math.random() * (to - from)));
	}
	
	public static int deg(int val, int deg)
	{
		if (deg > 1)
			return val * MathUtils.deg(val, deg - 1);
		else if (deg == 1)
			return val;
		else
			return 1;
	}
	
	public static int round(float f)
	{
		return Math.round(f);
	}
	
	public static Double percent(Number part, Long all)
	{
		if (all != null && all.longValue() > 0)
		{
			return part != null ? (part.doubleValue() * 100.0 / all.longValue()) : 0.0;
		}
		return null;
	}
	
}
