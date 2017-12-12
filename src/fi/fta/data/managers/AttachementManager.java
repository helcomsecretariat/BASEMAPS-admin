package fi.fta.data.managers;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedList;
import java.util.List;

import org.apache.commons.codec.binary.Base64;
import org.springframework.web.multipart.MultipartFile;

import fi.fta.beans.Pair;

public class AttachementManager
{
	
	private File path;
	
	public AttachementManager(String path)
	{
		this.path = new File(path);
	}
	
	public String checkName(String name)
	{
		String ret = name.substring(name.lastIndexOf(File.separator) + 1);
		ret = ret.replaceAll(" ", "_");
		return ret;
	}
	
	public Collection<String> getNames() throws IOException
	{
		LinkedList<String> ret = new LinkedList<String>();
		File[] files = path.listFiles();
		
		if (files == null || files.length == 0) 
			return ret;
		
		for (int i = 0; i < files.length; ++i)
			if (files[i].isFile())
				ret.addLast(files[i].getName());
		
		return ret;
	}
	
	public Collection<Pair<String, String>> getEncodedNames() throws IOException
	{
		LinkedList<Pair<String, String>> ret = new LinkedList<Pair<String, String>>();
		Collection<String> files = this.getNames(); 
		for (String name : files)
			ret.add(new Pair<String, String>(name, Base64.encodeBase64String(name.getBytes())));
		return ret;
	}
	
	public long getContentLength(String name) throws IOException
	{
		return new File(path.toString() + File.separator + this.checkName(name)).length();
	}
	
	public InputStream openStream(String name) throws IOException
	{
		String fileName = path.toString() + File.separator + this.checkName(name); 
		if (new File(fileName).canRead())
			return new FileInputStream(fileName);
		return null;
	}
	
	public void add(String name, String contentType, long contentLength, InputStream in) throws IOException
	{
		this.path.mkdirs();
		
		FileOutputStream out = null;
		long total = 0;
		try
		{
		    byte buffer[] = new byte[0x0000FFFF];
		    out = new FileOutputStream(path.toString() + File.separator + this.checkName(name));
		    while (in.available() > 0)
		    {
		    	int read = in.read(buffer);
		    	out.write(buffer, 0, read);
		    	total += read;
		    }
		}
		catch (Exception ex)
		{
		    ex.printStackTrace();
		}
		finally
		{
		    if (out != null)
		    	out.close();
		    if (contentLength > 0 && contentLength != total)
		        throw new IOException(total + " bytes of " + contentLength + " copied");
		}
	}
	
	public void add(MultipartFile file) throws IOException
	{
		InputStream stream = file.getInputStream();
		this.add(file.getOriginalFilename(), null, file.getSize(), stream);  
		stream.close();
	}
	
	public void remove(String name) throws IOException
	{
		File file = new File(path.toString() + File.separator + this.checkName(name));
		if (file.exists() && !file.delete())
		    throw new IOException("delete failed on " + path.toString() + File.separator + name);
		
		Collection<String> subitems = this.getNames();
		if (subitems == null || subitems.size() == 0)
			path.delete();
	}
	
	public boolean contains(String name) throws IOException
	{
		return this.getNames().contains(this.checkName(name));
	}
	
	public List<String> listFullNames() throws IOException
	{
		List<String> ret = new ArrayList<String>();
		for (String name : this.getNames())
			ret.add(path.toString() + File.separator + name);
		return ret;
	}
	
}
