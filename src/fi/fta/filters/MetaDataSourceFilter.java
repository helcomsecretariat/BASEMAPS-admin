package fi.fta.filters;

import fi.fta.beans.MetaData;
import fi.fta.beans.MetaDataSource;

public class MetaDataSourceFilter extends GenericFilter<MetaData>
{
	
	private MetaDataSource source;
	
	public MetaDataSourceFilter(MetaDataSource source)
	{
		this.source = source;
	}
	
	@Override
	public boolean match(MetaData obj)
	{
		return source == null || (obj.getSource() != null && source == obj.getSource());
	}

}
