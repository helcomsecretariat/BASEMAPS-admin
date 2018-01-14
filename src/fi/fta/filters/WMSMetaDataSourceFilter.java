package fi.fta.filters;

import fi.fta.beans.MetaDataSource;
import fi.fta.beans.WMSMetaData;

public class WMSMetaDataSourceFilter extends GenericFilter<WMSMetaData>
{
	
	private MetaDataSource source;
	
	public WMSMetaDataSourceFilter(MetaDataSource source)
	{
		this.source = source;
	}
	
	@Override
	public boolean match(WMSMetaData obj)
	{
		return source == null || (obj.getSource() != null && source == obj.getSource());
	}

}
