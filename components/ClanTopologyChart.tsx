import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TribeData } from '@/types';
import Colors from '@/constants/Colors';
import Layout from '@/constants/Layout';
import GufengIcon from './GufengIcons';

interface ClanTopologyChartProps {
  tribes: TribeData[];
}

interface ClanNode {
  tribe: TribeData;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ConnectionLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const ClanTopologyChart: React.FC<ClanTopologyChartProps> = ({ tribes }) => {
  const { nodes, connections, totalWidth, totalHeight } = useMemo(() => {
    const chartWidth = Layout.scale(800);
    const nodeWidth = Layout.scale(90);
    const nodeHeight = Layout.scale(70);
    const horizontalGap = Layout.scale(30);
    const verticalGap = Layout.scale(50);

    const mainClan = tribes.find(t => t.isMainClan);
    const otherTribes = tribes.filter(t => !t.isMainClan && t.discovered !== false);

    const clanTiers: Record<number, TribeData[]> = {};
    otherTribes.forEach(tribe => {
      const tier = tribe.tier || 1;
      if (!clanTiers[tier]) {
        clanTiers[tier] = [];
      }
      clanTiers[tier].push(tribe);
    });

    const nodes: ClanNode[] = [];
    const connections: ConnectionLine[] = [];

    if (mainClan) {
      const mainX = chartWidth / 2 - nodeWidth / 2;
      const mainY = Layout.scale(20);
      nodes.push({
        tribe: mainClan,
        x: mainX,
        y: mainY,
        width: nodeWidth,
        height: nodeHeight,
      });

      const sortedTiers = Object.keys(clanTiers)
        .map(Number)
        .sort((a, b) => a - b);

      sortedTiers.forEach(tier => {
        const tierTribes = clanTiers[tier];
        const tierY = mainY + tier * (nodeHeight + verticalGap);
        const totalWidth = tierTribes.length * nodeWidth + (tierTribes.length - 1) * horizontalGap;
        const startX = (chartWidth - totalWidth) / 2;

        tierTribes.forEach((tribe, index) => {
          const x = startX + index * (nodeWidth + horizontalGap);
          nodes.push({
            tribe,
            x,
            y: tierY,
            width: nodeWidth,
            height: nodeHeight,
          });

          const parentTribe = tribe.parentId 
            ? [...tribes, mainClan].find(t => t.id === tribe.parentId)
            : mainClan;
          if (parentTribe) {
            const parentNode = nodes.find(n => n.tribe.id === parentTribe.id);
            if (parentNode) {
              connections.push({
                x1: parentNode.x + parentNode.width / 2,
                y1: parentNode.y + parentNode.height,
                x2: x + nodeWidth / 2,
                y2: tierY,
              });
            }
          }
        });
      });
    } else {
      const mockMainClan: TribeData = {
        id: 'main-clan',
        name: '华夏氏族',
        icon: 'people',
        population: 1000,
        strength: 5000,
        status: 'vassal',
        isMainClan: true,
      };
      
      const mainX = chartWidth / 2 - nodeWidth / 2;
      const mainY = Layout.scale(20);
      nodes.push({
        tribe: mockMainClan,
        x: mainX,
        y: mainY,
        width: nodeWidth,
        height: nodeHeight,
      });

      const mockTribes: TribeData[] = [
        {
          id: 'tribe-1',
          name: '黑石部落',
          icon: 'sword',
          population: 300,
          strength: 1500,
          status: 'vassal',
          tier: 1,
          parentId: 'main-clan',
        },
        {
          id: 'tribe-2',
          name: '狂狼氏族',
          icon: 'shield',
          population: 250,
          strength: 1200,
          status: 'vassal',
          tier: 1,
          parentId: 'main-clan',
        },
        {
          id: 'tribe-3',
          name: '风语部族',
          icon: 'sparkles',
          population: 200,
          strength: 1000,
          status: 'friendly',
          tier: 1,
          parentId: 'main-clan',
        },
        {
          id: 'tribe-4',
          name: '雷霆联盟',
          icon: 'flame',
          population: 150,
          strength: 800,
          status: 'merged',
          tier: 2,
          parentId: 'tribe-1',
        },
      ];

      mockTribes.forEach(tribe => {
        const tier = tribe.tier || 1;
        const tierTribes = mockTribes.filter(t => t.tier === tier);
        const tierY = mainY + tier * (nodeHeight + verticalGap);
        const totalWidth = tierTribes.length * nodeWidth + (tierTribes.length - 1) * horizontalGap;
        const startX = (chartWidth - totalWidth) / 2;
        const index = tierTribes.findIndex(t => t.id === tribe.id);
        const x = startX + index * (nodeWidth + horizontalGap);

        if (!nodes.find(n => n.tribe.id === tribe.id)) {
          nodes.push({
            tribe,
            x,
            y: tierY,
            width: nodeWidth,
            height: nodeHeight,
          });

          const parentNode = nodes.find(n => n.tribe.id === tribe.parentId);
          if (parentNode) {
            connections.push({
              x1: parentNode.x + parentNode.width / 2,
              y1: parentNode.y + parentNode.height,
              x2: x + nodeWidth / 2,
              y2: tierY,
            });
          }
        }
      });
    }

    // 计算完整图表尺寸
    let maxX = 0;
    let maxY = 0;
    nodes.forEach(node => {
      maxX = Math.max(maxX, node.x + node.width);
      maxY = Math.max(maxY, node.y + node.height);
    });
    const padding = Layout.scale(40);
    
    return { 
      nodes, 
      connections, 
      totalWidth: Math.max(chartWidth, maxX) + padding, 
      totalHeight: maxY + padding + Layout.scale(20)
    };
  }, [tribes]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'merged':
        return '#4CAF50';
      case 'vassal':
        return '#2196F3';
      case 'friendly':
        return '#8BC34A';
      case 'neutral':
        return '#FFC107';
      case 'enemy':
        return '#F44336';
      case 'defeated':
        return '#9E9E9E';
      default:
        return Colors.accent;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'merged':
        return '合并';
      case 'vassal':
        return '附庸';
      case 'friendly':
        return '友好';
      case 'neutral':
        return '中立';
      case 'enemy':
        return '敌对';
      case 'defeated':
        return '击败';
      default:
        return '未知';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <GufengIcon name="people" size={Layout.scale(20)} />
        <Text style={styles.title}>氏族关系拓扑图</Text>
      </View>

      <View style={[styles.chartContainer, { width: totalWidth, height: totalHeight }]}>
        {connections.map((conn, index) => (
          <View
            key={`conn-${index}`}
            style={[
              styles.connectionLine,
              {
                left: Math.min(conn.x1, conn.x2),
                top: conn.y1,
                width: Math.abs(conn.x2 - conn.x1),
                height: conn.y2 - conn.y1,
              },
            ]}
          />
        ))}

        {nodes.map((node) => (
          <View
            key={node.tribe.id}
            style={[
              styles.node,
              {
                left: node.x,
                top: node.y,
                width: node.width,
                height: node.height,
                borderColor: getStatusColor(node.tribe.status),
                backgroundColor: node.tribe.isMainClan ? Colors.card : Colors.backgroundLight,
              },
            ]}
          >
            {node.tribe.isMainClan && (
              <View style={styles.mainClanBadge}>
                <Text style={styles.mainClanBadgeText}>主氏族</Text>
              </View>
            )}

            <View style={styles.nodeIcon}>
              <GufengIcon 
                name={(node.tribe.icon as any) || 'people'} 
                size={Layout.scale(20)} 
                color={getStatusColor(node.tribe.status)}
              />
            </View>

            <Text style={styles.nodeName} numberOfLines={2}>
              {node.tribe.name}
            </Text>

            <View style={styles.nodeStats}>
              <Text style={styles.nodeStat}>
                {node.tribe.population}人
              </Text>
            </View>

            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(node.tribe.status) + '30' }
            ]}>
              <Text style={[
                styles.statusText,
                { color: getStatusColor(node.tribe.status) }
              ]}>
                {getStatusText(node.tribe.status)}
              </Text>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendTitle}>图例：</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#4CAF50' }]} />
            <Text style={styles.legendText}>合并</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#2196F3' }]} />
            <Text style={styles.legendText}>附庸</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#8BC34A' }]} />
            <Text style={styles.legendText}>友好</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFC107' }]} />
            <Text style={styles.legendText}>中立</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#F44336' }]} />
            <Text style={styles.legendText}>敌对</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Layout.scale(16),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.scale(8),
    marginBottom: Layout.scale(16),
    paddingBottom: Layout.scale(12),
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.subtle,
  },
  title: {
    color: Colors.accent,
    fontSize: Layout.scale(18),
    fontWeight: 'bold',
  },
  chartContainer: {
    position: 'relative',
    backgroundColor: Colors.background,
    borderRadius: Layout.borderRadius,
    borderWidth: 2,
    borderColor: Colors.border.subtle,
  },
  connectionLine: {
    position: 'absolute',
    borderLeftWidth: 2,
    borderLeftColor: Colors.accent + '60',
    borderBottomWidth: 2,
    borderBottomColor: Colors.accent + '60',
  },
  node: {
    position: 'absolute',
    borderWidth: 3,
    borderRadius: Layout.borderRadius,
    padding: Layout.scale(8),
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mainClanBadge: {
    position: 'absolute',
    top: Layout.scale(-6),
    backgroundColor: Colors.accent,
    paddingHorizontal: Layout.scale(8),
    paddingVertical: Layout.scale(2),
    borderRadius: Layout.borderRadiusSmall,
  },
  mainClanBadgeText: {
    color: Colors.primaryDark,
    fontSize: Layout.scale(8),
    fontWeight: 'bold',
  },
  nodeIcon: {
    marginBottom: Layout.scale(4),
  },
  nodeName: {
    color: Colors.text,
    fontSize: Layout.scale(10),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: Layout.scale(2),
  },
  nodeStats: {
    marginBottom: Layout.scale(2),
  },
  nodeStat: {
    color: Colors.textSecondary,
    fontSize: Layout.scale(9),
  },
  statusBadge: {
    paddingHorizontal: Layout.scale(6),
    paddingVertical: Layout.scale(1),
    borderRadius: Layout.borderRadiusSmall,
  },
  statusText: {
    fontSize: Layout.scale(8),
    fontWeight: 'bold',
  },
  legend: {
    marginTop: Layout.scale(16),
    padding: Layout.scale(12),
    backgroundColor: Colors.card,
    borderRadius: Layout.borderRadius,
    borderWidth: 1,
    borderColor: Colors.border.subtle,
  },
  legendTitle: {
    color: Colors.accent,
    fontSize: Layout.scale(12),
    fontWeight: 'bold',
    marginBottom: Layout.scale(8),
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.scale(12),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.scale(4),
  },
  legendColor: {
    width: Layout.scale(12),
    height: Layout.scale(12),
    borderRadius: Layout.scale(2),
  },
  legendText: {
    color: Colors.textSecondary,
    fontSize: Layout.scale(10),
  },
});

export default ClanTopologyChart;
