import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ScrapeRequest {
  url: string;
  keyword: string;
  userId?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const firecrawlApiKey = Deno.env.get('FIRECRAWL_API_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { url, keyword, userId }: ScrapeRequest = await req.json();

    if (!url || !keyword) {
      return new Response(
        JSON.stringify({ error: 'URL and keyword are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!firecrawlApiKey || !openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'API keys not configured. Please set FIRECRAWL_API_KEY and OPENAI_API_KEY.' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let validUrl: URL;
    try {
      validUrl = new URL(url);
      if (!['http:', 'https:'].includes(validUrl.protocol)) {
        throw new Error('Only HTTP and HTTPS protocols are supported');
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid URL format' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const insertData: any = { url, keyword, status: 'pending' };
    if (userId) {
      insertData.user_id = userId;
    }

    const { data: scrapeRecord, error: insertError } = await supabase
      .from('scrapes')
      .insert(insertData)
      .select()
      .single();

    if (insertError || !scrapeRecord) {
      return new Response(
        JSON.stringify({ error: 'Failed to create scrape record' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          formats: ['markdown', 'html'],
        }),
      });

      if (!firecrawlResponse.ok) {
        throw new Error(`Firecrawl API error: ${firecrawlResponse.status}`);
      }

      const firecrawlData = await firecrawlResponse.json();
      const scrapedContent = firecrawlData.data?.markdown || firecrawlData.data?.html || '';
      const pageTitle = firecrawlData.data?.metadata?.title || 'Untitled';

      if (!scrapedContent) {
        throw new Error('No content extracted from website');
      }

      const summaryPrompt = `You are a research analyst. Based on the following website content, provide a concise and comprehensive summary of what this webpage is trying to convey about "${keyword}".

Website Content:
${scrapedContent.substring(0, 12000)}

Provide a clear summary (200-300 words) that captures:
1. The main message or purpose of the content
2. Key points and arguments presented
3. The perspective or stance taken
4. Main conclusions or takeaways

Write in a clear, professional tone suitable for business discussions.`;

      const summaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert research analyst specializing in content summarization.' },
            { role: 'user', content: summaryPrompt },
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      if (!summaryResponse.ok) {
        throw new Error(`OpenAI API error: ${summaryResponse.status}`);
      }

      const summaryData = await summaryResponse.json();
      const urlSummary = summaryData.choices[0]?.message?.content || 'Summary not available';

      const originPrompt = `You are a research analyst. Based on the website content about "${keyword}", identify key points about its ORIGIN and HISTORY.

Website Content:
${scrapedContent.substring(0, 12000)}

Generate a JSON object with a "points" array containing 3-5 key points about the origin/history. Each point in the array should include:
1. "point": A clear statement (1-2 sentences)
2. "searchQuery": A specific search query to find credible sources that verify this point

Required JSON structure:
{
  "points": [
    {"point": "statement here", "searchQuery": "search query here"},
    {"point": "another statement", "searchQuery": "another search query"}
  ]
}

Focus on: earliest mentions, verified origins, historical context, key milestones, and credible sources.`;

      const originResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert research analyst. Always respond with valid JSON only.' },
            { role: 'user', content: originPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: "json_object" },
        }),
      });

      if (!originResponse.ok) {
        throw new Error(`OpenAI API error: ${originResponse.status}`);
      }

      const originData = await originResponse.json();
      let originPoints = [];
      try {
        const content = originData.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);
        originPoints = Array.isArray(parsed.points) ? parsed.points : [];

        if (originPoints.length === 0) {
          console.log('Origin points empty. Parsed content:', parsed);
        }
      } catch (e) {
        console.error('Error parsing origin analysis:', e);
        originPoints = [];
      }

      const trendsPrompt = `You are a research analyst. Based on the website content about "${keyword}", identify key points about RECENT UPDATES and FUTURE TRENDS.

Website Content:
${scrapedContent.substring(0, 12000)}

Generate a JSON object with a "points" array containing 3-5 key points about trends/forecasts. Each point in the array should include:
1. "point": A clear statement (1-2 sentences)
2. "searchQuery": A specific search query to find credible sources that verify this point

Required JSON structure:
{
  "points": [
    {"point": "statement here", "searchQuery": "search query here"},
    {"point": "another statement", "searchQuery": "another search query"}
  ]
}

Focus on: latest developments, current trends, future forecasts, emerging opportunities, and expert insights.`;

      const trendsResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert research analyst. Always respond with valid JSON only.' },
            { role: 'user', content: trendsPrompt },
          ],
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: "json_object" },
        }),
      });

      if (!trendsResponse.ok) {
        throw new Error(`OpenAI API error: ${trendsResponse.status}`);
      }

      const trendsData = await trendsResponse.json();
      let trendsPoints = [];
      try {
        const content = trendsData.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);
        trendsPoints = Array.isArray(parsed.points) ? parsed.points : [];

        if (trendsPoints.length === 0) {
          console.log('Trends points empty. Parsed content:', parsed);
        }
      } catch (e) {
        console.error('Error parsing trends analysis:', e);
        trendsPoints = [];
      }

      const braveApiKey = Deno.env.get('BRAVE_SEARCH_API_KEY');

      const searchForReferences = async (searchQuery: string) => {
        if (!braveApiKey) {
          return [];
        }

        try {
          const encodedQuery = encodeURIComponent(searchQuery);
          const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodedQuery}&count=2`, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'X-Subscription-Token': braveApiKey,
            },
          });

          if (!response.ok) {
            return [];
          }

          const data = await response.json();
          return (data.web?.results || []).map((r: any) => ({
            url: r.url,
            title: r.title,
          }));
        } catch (e) {
          return [];
        }
      };

      const originWithRefs = await Promise.all(
        originPoints.map(async (point: any) => {
          const refs = await searchForReferences(point.searchQuery || '');
          return {
            ...point,
            references: refs,
          };
        })
      );

      const trendsWithRefs = await Promise.all(
        trendsPoints.map(async (point: any) => {
          const refs = await searchForReferences(point.searchQuery || '');
          return {
            ...point,
            references: refs,
          };
        })
      );

      const originAnalysis = JSON.stringify(originWithRefs);
      const trendsAnalysis = JSON.stringify(trendsWithRefs);

      const socialMediaPrompt = `You are a creative social media content writer. Based on the Origin Analysis and Trends Analysis provided, generate 6 social media posts total.

Origin Analysis:
${originAnalysis}

Trends Analysis:
${trendsAnalysis}

Keyword: "${keyword}"

Generate a JSON object with the following structure:
{
  "comedic": [
    {"id": "1", "content": "post content here", "category": "comedic"},
    {"id": "2", "content": "post content here", "category": "comedic"},
    {"id": "3", "content": "post content here", "category": "comedic"}
  ],
  "serious": [
    {"id": "4", "content": "post content here", "category": "serious"},
    {"id": "5", "content": "post content here", "category": "serious"},
    {"id": "6", "content": "post content here", "category": "serious"}
  ]
}

Requirements:

COMEDIC POSTS (3 posts):
- Write in the style of a "Current Best Comedian" - fun, humorous, lots of laughter
- Use jokes, puns, and lighthearted observations
- Reference key ideas from both Origin Analysis and Trends & Forecast
- Keep each post 1-3 short paragraphs suitable for social media
- Make people laugh while being informative

SERIOUS/CONTROVERSIAL POSTS (3 posts):
- Write in a serious, slightly provocative tone (but still professional)
- Highlight risks, debates, or strong opinions
- Challenge conventional thinking
- Reference insights from both analyses
- Keep each post 1-3 short paragraphs suitable for social media
- Maintain professionalism while being thought-provoking`;

      const socialMediaResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are an expert social media content creator. Always respond with valid JSON only.' },
            { role: 'user', content: socialMediaPrompt },
          ],
          temperature: 0.9,
          max_tokens: 2000,
          response_format: { type: "json_object" },
        }),
      });

      let socialMediaPosts = JSON.stringify({ comedic: [], serious: [] });
      if (socialMediaResponse.ok) {
        try {
          const socialMediaData = await socialMediaResponse.json();
          const content = socialMediaData.choices[0]?.message?.content || '{}';
          const parsed = JSON.parse(content);
          if (parsed.comedic && parsed.serious) {
            socialMediaPosts = JSON.stringify(parsed);
          }
        } catch (e) {
          console.error('Error parsing social media posts:', e);
        }
      }

      await supabase
        .from('scrapes')
        .update({
          status: 'completed',
          title: pageTitle,
          scraped_content: scrapedContent.substring(0, 50000),
          url_summary: urlSummary,
          origin_analysis: originAnalysis,
          trends_analysis: trendsAnalysis,
          social_media_posts: socialMediaPosts,
          reference_links: JSON.stringify([url]),
          completed_at: new Date().toISOString(),
        })
        .eq('id', scrapeRecord.id);

      return new Response(
        JSON.stringify({ 
          success: true, 
          scrapeId: scrapeRecord.id,
          title: pageTitle,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } catch (scrapeError) {
      await supabase
        .from('scrapes')
        .update({
          status: 'failed',
          error: scrapeError instanceof Error ? scrapeError.message : 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('id', scrapeRecord.id);

      return new Response(
        JSON.stringify({ 
          success: false, 
          error: scrapeError instanceof Error ? scrapeError.message : 'Failed to process request',
          scrapeId: scrapeRecord.id,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});